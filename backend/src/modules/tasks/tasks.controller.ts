import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Task } from '../../models/Task.js';
import { Campaign } from '../../models/Campaign.js';
import { User } from '../../models/User.js';
import { Transaction } from '../../models/Transaction.js';
import { config } from '../../config/index.js';
import { cacheService } from '../../services/cache.service.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware.js';
import { getSystemPricingTiers, getSystemCooldownSettings, getSystemDailyLimitSettings, getSystemHourlyLimitSettings } from '../admin/admin.controller.js';

const router = Router();

// GET /api/tasks/next - fetch next eligible task for viewer
router.get('/next', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();

    // 1. Check hourly video limit (if configured by admin)
    const hourlyLimitSettings = await getSystemHourlyLimitSettings();
    if (hourlyLimitSettings.enableHourlyLimit && hourlyLimitSettings.maxHourlyVideos > 0) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const hourWatchedCount = await Task.countDocuments({
        viewerId: req.user!._id,
        status: 'completed',
        $or: [
          { completedAt: { $gte: oneHourAgo } },
          { createdAt: { $gte: oneHourAgo } },
        ],
      });

      if (hourWatchedCount >= hourlyLimitSettings.maxHourlyVideos) {
        res.status(429).json({
          success: false,
          error: `Hourly video limit reached! You have completed ${hourWatchedCount}/${hourlyLimitSettings.maxHourlyVideos} videos in the past hour. Please take a short break and return shortly!`,
          hourlyLimitReached: true,
          hourWatchedCount,
          maxHourlyVideos: hourlyLimitSettings.maxHourlyVideos,
        });
        return;
      }
    }

    // 2. Check daily video limit (if configured by admin)
    const dailyLimitSettings = await getSystemDailyLimitSettings();
    if (dailyLimitSettings.enableDailyLimit && dailyLimitSettings.maxDailyVideos > 0) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayWatchedCount = await Task.countDocuments({
        viewerId: req.user!._id,
        status: 'completed',
        $or: [
          { completedAt: { $gte: startOfDay } },
          { createdAt: { $gte: startOfDay } },
        ],
      });

      if (todayWatchedCount >= dailyLimitSettings.maxDailyVideos) {
        res.status(429).json({
          success: false,
          error: `Daily video limit reached! You have completed ${todayWatchedCount}/${dailyLimitSettings.maxDailyVideos} videos today. Please return tomorrow after midnight to watch more!`,
          dailyLimitReached: true,
          todayWatchedCount,
          maxDailyVideos: dailyLimitSettings.maxDailyVideos,
        });
        return;
      }
    }

    // Find active campaigns that still have views to deliver
    const activeCampaigns = await Campaign.find({
      status: 'active',
      $expr: { $lt: ['$viewsDelivered', '$targetViews'] },
    }).sort({ createdAt: 1 });

    if (!activeCampaigns.length) {
      res.status(404).json({
        success: false,
        error: 'No active video campaigns available at the moment. Please check back shortly!',
      });
      return;
    }

    const cooldownSettings = await getSystemCooldownSettings();
    const pricingTiers = await getSystemPricingTiers();

    // Round-robin: find the viewer's most recent task to rotate past it
    // so each request gives a different campaign when multiple are available
    const lastTask = await Task.findOne({ viewerId: req.user!._id })
      .sort({ createdAt: -1 })
      .select('campaignId')
      .lean();

    let orderedCampaigns = activeCampaigns;
    if (lastTask?.campaignId && activeCampaigns.length > 1) {
      const lastIdx = activeCampaigns.findIndex(
        (c: any) => c._id.toString() === lastTask.campaignId.toString()
      );
      if (lastIdx >= 0) {
        // Start from the campaign AFTER the last-watched one, wrapping around
        orderedCampaigns = [
          ...activeCampaigns.slice(lastIdx + 1),
          ...activeCampaigns.slice(0, lastIdx + 1),
        ];
      }
    }

    // Filter by cooldown (if enabled)
    let selectedCampaign: any = null;
    for (const camp of orderedCampaigns) {
      const isCooldown = cooldownSettings.enableCooldown && cooldownSettings.videoCooldownSeconds > 0
        ? await cacheService.hasCooldown(userId, camp.videoId)
        : false;
      if (!isCooldown) {
        selectedCampaign = camp;
        break;
      }
    }

    if (!selectedCampaign) {
      res.status(429).json({
        success: false,
        error: 'All available videos have been watched within the anti-spam cooldown window. Cooldown in progress.',
      });
      return;
    }

    const tier = pricingTiers[selectedCampaign.watchDurationSec] || pricingTiers[300];
    const rewardAmount = tier ? tier.viewerReward : Number(((selectedCampaign.pricePerView || 0.0320) * 0.72).toFixed(4));

    // Create assigned task
    const task = await Task.create({
      campaignId: selectedCampaign._id,
      viewerId: req.user!._id,
      videoId: selectedCampaign.videoId,
      requiredDurationSec: selectedCampaign.watchDurationSec,
      rewardAmount,
      status: 'assigned',
    });

    res.json({
      success: true,
      data: {
        taskId: task._id,
        videoId: selectedCampaign.videoId,
        requiredDurationSec: selectedCampaign.watchDurationSec,
        rewardAmount,
        title: selectedCampaign.title,
        thumbnailUrl: selectedCampaign.thumbnailUrl,
        youtubeDeepLink: `vnd.youtube:${selectedCampaign.videoId}`,
        youtubeWebUrl: `https://www.google.com/url?sa=t&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${selectedCampaign.videoId}`)}`,
        directVideoUrl: `https://www.youtube.com/watch?v=${selectedCampaign.videoId}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tasks/:id/start - server stamps start time
router.post('/:id/start', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      viewerId: req.user!._id,
      status: 'assigned',
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found or already started' });
      return;
    }

    task.status = 'in_progress';
    task.startedAt = new Date();
    await task.save();

    res.json({
      success: true,
      data: {
        taskId: task._id,
        startedAt: task.startedAt,
        requiredDurationSec: task.requiredDurationSec,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tasks/:id/complete - server-authoritative verification & reward
router.post('/:id/complete', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { overlayConfirmed, deviceId } = req.body;
    const task = await Task.findOne({
      _id: req.params.id,
      viewerId: req.user!._id,
      status: 'in_progress',
    });

    if (!task || !task.startedAt) {
      res.status(404).json({ success: false, error: 'Task not found or not currently in progress' });
      return;
    }

    const now = Date.now();
    const elapsedSec = (now - task.startedAt.getTime()) / 1000;
    const minRequired = task.requiredDurationSec - config.timeToleranceSeconds;

    // Rule 1: Server-Authoritative Timing check
    if (elapsedSec < minRequired) {
      task.status = 'failed';
      await task.save();
      res.status(400).json({
        success: false,
        error: `Insufficient watch time detected by server. Required ${task.requiredDurationSec}s, but only ${elapsedSec.toFixed(1)}s elapsed. Reward denied.`,
      });
      return;
    }

    // Mark task completed
    task.status = 'completed';
    task.completedAt = new Date();
    task.actualDurationSec = Math.round(elapsedSec);
    task.verificationMeta = {
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      deviceId: deviceId || 'web-simulated',
      overlayConfirmed: !!overlayConfirmed,
    };
    await task.save();

    // Calculate USD cash reward based on pricing tier (fallback to 300s tier)
    const pricingTiers = await getSystemPricingTiers();
    const tier = pricingTiers[task.requiredDurationSec] || pricingTiers[300];
    const rewardAmount = tier ? tier.viewerReward : (task.rewardAmount || 0.0230);

    // Atomic direct USD balance and totalEarned increment to viewer
    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      { $inc: { viewerBalance: rewardAmount, balance: rewardAmount, totalEarned: rewardAmount } },
      { new: true }
    );

    // Atomic delivery count increment on campaign
    const campaign = await Campaign.findByIdAndUpdate(
      task.campaignId,
      { $inc: { viewsDelivered: 1 } },
      { new: true }
    );

    if (campaign && campaign.viewsDelivered >= campaign.targetViews) {
      campaign.status = 'completed';
      await campaign.save();
    }

    // Record direct earning transaction in USD
    await Transaction.create({
      userId: req.user!._id,
      role: 'viewer',
      type: 'earning',
      amount: rewardAmount,
      balanceAfter: updatedUser?.viewerBalance !== undefined ? updatedUser.viewerBalance : (updatedUser?.balance || 0),
      status: 'completed',
      referenceId: task._id.toString(),
      notes: `+$${rewardAmount.toFixed(4)} USD earned from ${task.requiredDurationSec}s video view (${task.videoId})`,
    });

    // 10% Referral Commission credited to referrer in real-time
    if (updatedUser?.referredBy) {
      const referralCommission = Number((rewardAmount * 0.10).toFixed(6));
      if (referralCommission > 0) {
        try {
          const referrer = await User.findByIdAndUpdate(
            updatedUser.referredBy,
            {
              $inc: {
                viewerBalance: referralCommission,
                balance: referralCommission,
                totalEarned: referralCommission,
                referralEarnings: referralCommission,
              },
            },
            { new: true }
          );

          if (referrer) {
            await Transaction.create({
              userId: referrer._id,
              role: 'viewer',
              type: 'referral_commission',
              amount: referralCommission,
              balanceAfter: referrer.viewerBalance !== undefined ? referrer.viewerBalance : referrer.balance,
              status: 'completed',
              referenceId: task._id.toString(),
              notes: `10% referral reward (+$${referralCommission.toFixed(4)} USD) from ${updatedUser.name || 'referral'}'s watch task`,
            });
          }
        } catch (refErr) {
          console.error('[Referral] Failed to credit referral commission:', refErr);
        }
      }
    }

    // Enforce cooldown in Redis/Cache if enabled
    const cooldownSettings = await getSystemCooldownSettings();
    if (cooldownSettings.enableCooldown && cooldownSettings.videoCooldownSeconds > 0) {
      await cacheService.setCooldown(
        req.user!._id.toString(),
        task.videoId,
        cooldownSettings.videoCooldownSeconds
      );
    }

    // Prune old tasks for this viewer to retain only latest 20 view records
    try {
      const excessTasks = await Task.find({ viewerId: req.user!._id })
        .sort({ createdAt: -1 })
        .skip(20)
        .select('_id');
      if (excessTasks.length > 0) {
        await Task.deleteMany({ _id: { $in: excessTasks.map((t) => t._id) } });
      }
    } catch (cleanupErr) {
      console.warn('[TaskCleanup] Error pruning old tasks:', cleanupErr);
    }

    res.json({
      success: true,
      data: {
        rewardAmount,
        newBalance: updatedUser?.balance || 0,
        viewerBalance: updatedUser?.viewerBalance || 0,
        creatorBalance: updatedUser?.creatorBalance || 0,
        totalEarned: updatedUser?.totalEarned || 0,
        actualDurationSec: task.actualDurationSec,
        message: `Task successfully verified! +$${rewardAmount.toFixed(4)} USD credited directly to your wallet.`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tasks/history - Viewer's completed tasks (latest 20 view history records)
router.get('/history', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ viewerId: req.user!._id })
      .populate('campaignId', 'title videoId thumbnailUrl')
      .sort({ createdAt: -1 })
      .limit(20);

    // Asynchronously ensure database only keeps latest 20 tasks
    Task.find({ viewerId: req.user!._id })
      .sort({ createdAt: -1 })
      .skip(20)
      .select('_id')
      .then((oldRecords) => {
        if (oldRecords && oldRecords.length > 0) {
          Task.deleteMany({ _id: { $in: oldRecords.map((t) => t._id) } }).catch(() => {});
        }
      })
      .catch(() => {});

    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tasks/viewer-stats - Viewer live statistics & remaining limits
router.get('/viewer-stats', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [dailyLimitSettings, hourlyLimitSettings, todayTasks, hourWatchedCount, totalViewsCount, userDoc] = await Promise.all([
      getSystemDailyLimitSettings(),
      getSystemHourlyLimitSettings(),
      Task.find({
        viewerId: userId,
        status: 'completed',
        $or: [
          { completedAt: { $gte: startOfDay } },
          { createdAt: { $gte: startOfDay } },
        ],
      }).select('rewardAmount actualDurationSec'),
      Task.countDocuments({
        viewerId: userId,
        status: 'completed',
        $or: [
          { completedAt: { $gte: oneHourAgo } },
          { createdAt: { $gte: oneHourAgo } },
        ],
      }),
      Task.countDocuments({
        viewerId: userId,
        status: 'completed',
      }),
      User.findById(userId).select('totalEarned balance viewerBalance'),
    ]);

    const dailyViews = todayTasks.length;
    const dailyEarnings = todayTasks.reduce((sum, t) => sum + (t.rewardAmount || 0.0035), 0);
    const userViewerBal = userDoc?.viewerBalance !== undefined ? userDoc.viewerBalance : (userDoc?.balance || 0);
    const totalEarnings = Math.max(userDoc?.totalEarned || 0, userViewerBal, dailyEarnings);

    const remainingDaily = dailyLimitSettings.enableDailyLimit && dailyLimitSettings.maxDailyVideos > 0
      ? Math.max(0, dailyLimitSettings.maxDailyVideos - dailyViews)
      : null;

    const remainingHourly = hourlyLimitSettings.enableHourlyLimit && hourlyLimitSettings.maxHourlyVideos > 0
      ? Math.max(0, hourlyLimitSettings.maxHourlyVideos - hourWatchedCount)
      : null;

    res.json({
      success: true,
      data: {
        dailyEarnings: Number(dailyEarnings.toFixed(4)),
        totalEarnings: Number(totalEarnings.toFixed(4)),
        dailyViews,
        totalViews: totalViewsCount,
        dailyLimit: {
          enabled: dailyLimitSettings.enableDailyLimit,
          maxDailyVideos: dailyLimitSettings.maxDailyVideos,
          todayWatched: dailyViews,
          remaining: remainingDaily,
        },
        hourlyLimit: {
          enabled: hourlyLimitSettings.enableHourlyLimit,
          maxHourlyVideos: hourlyLimitSettings.maxHourlyVideos,
          hourWatched: hourWatchedCount,
          remaining: remainingHourly,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const tasksRouter = router;
