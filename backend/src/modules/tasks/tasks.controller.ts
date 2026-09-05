import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Task } from '../../models/Task.js';
import { Campaign } from '../../models/Campaign.js';
import { User } from '../../models/User.js';
import { Transaction } from '../../models/Transaction.js';
import { config } from '../../config/index.js';
import { cacheService } from '../../services/cache.service.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware.js';
import { getSystemPricingTiers, getSystemCooldownSettings } from '../admin/admin.controller.js';

const router = Router();

// GET /api/tasks/next - fetch next eligible task for viewer
router.get('/next', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();

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

    // Filter by cooldown (if enabled)
    let selectedCampaign: any = null;
    for (const camp of activeCampaigns) {
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

    const tier = pricingTiers[selectedCampaign.watchDurationSec];
    const rewardAmount = tier ? tier.viewerReward : Number(((selectedCampaign.pricePerView || 0.005) * 0.72).toFixed(4));

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

    // Calculate USD cash reward based on pricing tier (fallback $0.0035)
    const pricingTiers = await getSystemPricingTiers();
    const tier = pricingTiers[task.requiredDurationSec];
    const rewardAmount = tier ? tier.viewerReward : (task.rewardAmount || 0.0035);

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
      type: 'earning',
      amount: rewardAmount,
      balanceAfter: updatedUser?.balance || 0,
      status: 'completed',
      referenceId: task._id.toString(),
      notes: `+$${rewardAmount.toFixed(4)} USD earned from ${task.requiredDurationSec}s video view (${task.videoId})`,
    });

    // Enforce cooldown in Redis/Cache if enabled
    const cooldownSettings = await getSystemCooldownSettings();
    if (cooldownSettings.enableCooldown && cooldownSettings.videoCooldownSeconds > 0) {
      await cacheService.setCooldown(
        req.user!._id.toString(),
        task.videoId,
        cooldownSettings.videoCooldownSeconds
      );
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

// GET /api/tasks/history - Viewer's completed tasks
router.get('/history', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ viewerId: req.user!._id })
      .populate('campaignId', 'title videoId thumbnailUrl')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const tasksRouter = router;
