import { Router, Response } from 'express';
import { User } from '../../models/User.js';
import { Campaign } from '../../models/Campaign.js';
import { Payout } from '../../models/Payout.js';
import { Transaction } from '../../models/Transaction.js';
import { Task } from '../../models/Task.js';
import { Setting } from '../../models/Setting.js';
import { requireAdmin, AuthRequest } from '../../middleware/auth.middleware.js';
import { config } from '../../config/index.js';

export const getSystemExchangeRate = async (): Promise<number> => {
  try {
    const setting = await Setting.findOne({ key: 'usd_to_bdt_rate' });
    if (setting && typeof setting.value === 'number' && setting.value > 0) {
      return setting.value;
    }
  } catch {
    // fallback to default
  }
  return 122;
};

export const getSystemPricingTiers = async (): Promise<Record<number, { campaignerCost: number; viewerReward: number }>> => {
  try {
    const setting = await Setting.findOne({ key: 'pricing_tiers' });
    if (setting && setting.value && typeof setting.value === 'object') {
      return setting.value;
    }
  } catch {
    // fallback
  }
  return config.pricingTiers;
};

export const getSystemCooldownSettings = async (): Promise<{ enableCooldown: boolean; videoCooldownSeconds: number }> => {
  try {
    const setting = await Setting.findOne({ key: 'cooldown_settings' });
    if (setting && setting.value && typeof setting.value === 'object') {
      return {
        enableCooldown: typeof setting.value.enableCooldown === 'boolean' ? setting.value.enableCooldown : config.enableCooldown,
        videoCooldownSeconds: typeof setting.value.videoCooldownSeconds === 'number' ? setting.value.videoCooldownSeconds : config.videoCooldownSeconds,
      };
    }
  } catch {
    // fallback
  }
  return {
    enableCooldown: config.enableCooldown,
    videoCooldownSeconds: config.videoCooldownSeconds,
  };
};

const router = Router();

// GET /api/admin/stats - Platform overview & comprehensive telemetry
router.get('/stats', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const totalCampaigns = await Campaign.countDocuments();
    const totalTasksCompleted = await Task.countDocuments({ status: 'completed' });
    const pendingPayoutsCount = await Payout.countDocuments({ status: 'pending' });

    // Aggregate delivered views
    const deliveredAgg = await Campaign.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewsDelivered' } } },
    ]);
    const totalViewsDelivered = deliveredAgg[0]?.totalViews || 0;

    // Aggregate total watch hours
    const watchTimeAgg = await Task.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalSeconds: { $sum: '$actualDurationSec' } } },
    ]);
    const totalWatchSeconds = watchTimeAgg[0]?.totalSeconds || 0;
    const totalWatchHours = Number((totalWatchSeconds / 3600).toFixed(2));

    // Aggregate financials
    const spendAgg = await Transaction.aggregate([
      { $match: { type: 'campaign_spend', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalSpendUsd = Number(Math.abs(spendAgg[0]?.total || 0).toFixed(2));

    const depositAgg = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalDepositsUsd = Number((depositAgg[0]?.total || 0).toFixed(2));

    const payoutsAgg = await Payout.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalPayoutsUsd = Number((payoutsAgg[0]?.total || 0).toFixed(2));

    const pendingPayoutsAgg = await Payout.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingPayoutsUsd = Number((pendingPayoutsAgg[0]?.total || 0).toFixed(2));

    // 7-day trend calculation
    const dayLabels: string[] = [];
    const dailyWatchHours: number[] = [];
    const dailySpend: number[] = [];
    const dailyViews: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayLabels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      // Tasks / Watch hours
      const dayTasks = await Task.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, sec: { $sum: '$actualDurationSec' }, count: { $sum: 1 } } },
      ]);
      const daySec = dayTasks[0]?.sec || 0;
      dailyWatchHours.push(Number((daySec / 3600).toFixed(2)));
      dailyViews.push(dayTasks[0]?.count || 0);

      // Spend
      const daySpend = await Transaction.aggregate([
        { $match: { type: 'campaign_spend', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      dailySpend.push(Number(Math.abs(daySpend[0]?.total || 0).toFixed(2)));
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        activeCampaigns,
        totalCampaigns,
        totalTasksCompleted,
        totalViewsDelivered,
        totalWatchHours,
        totalSpendUsd,
        totalDepositsUsd,
        totalPayoutsUsd,
        pendingPayoutsCount,
        pendingPayoutsUsd,
        dailyWatchHours,
        dailySpend,
        dailyViews,
        dayLabels,
        simulatedConcurrency: Math.floor(4100 + Math.random() * 450),
        serverHealth: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/users - User management list
router.get('/users', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/users/:id/status - Ban or unban user
router.post('/users/:id/status', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'banned'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/campaigns - List all campaigns
router.get('/campaigns', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find()
      .populate('ownerId', 'email name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/campaigns/:id/status - Moderate campaign (pause/resume/cancel)
router.post('/campaigns/:id/status', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!campaign) {
      res.status(404).json({ success: false, error: 'Campaign not found' });
      return;
    }
    res.json({ success: true, data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/payouts - List withdrawal queue
router.get('/payouts', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const payouts = await Payout.find(filter)
      .populate('viewerId', 'name email balance viewerBalance totalEarned totalWithdrawn')
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ success: true, data: payouts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/payouts/:id/approve - Approve payout
router.post('/payouts/:id/approve', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transactionRef, adminNotes } = req.body;
    const payout = await Payout.findById(req.params.id);
    if (!payout || payout.status !== 'pending') {
      res.status(400).json({ success: false, error: 'Payout not found or not in pending state' });
      return;
    }

    payout.status = 'approved';
    payout.transactionRef = transactionRef || `TXN-${Date.now()}`;
    payout.adminNotes = adminNotes || 'Disbursed manually by Admin';
    payout.processedAt = new Date();
    await payout.save();

    // Update corresponding transaction status
    await Transaction.findOneAndUpdate(
      { referenceId: payout._id.toString() },
      { status: 'completed', notes: `Disbursed via ${payout.method.toUpperCase()} (Ref: ${payout.transactionRef})` }
    );

    res.json({ success: true, data: payout, message: 'Payout approved and marked completed!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/payouts/:id/reject - Reject payout & refund user balance
router.post('/payouts/:id/reject', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNotes } = req.body;
    const payout = await Payout.findById(req.params.id);
    if (!payout || payout.status !== 'pending') {
      res.status(400).json({ success: false, error: 'Payout not found or not in pending state' });
      return;
    }

    payout.status = 'rejected';
    payout.adminNotes = adminNotes || 'Rejected by Admin';
    payout.processedAt = new Date();
    await payout.save();

    // Atomic refund back to user wallet (both balance and viewerBalance) and reverse totalWithdrawn
    const updatedUser = await User.findByIdAndUpdate(
      payout.viewerId,
      { $inc: { balance: payout.amount, viewerBalance: payout.amount, totalWithdrawn: -payout.amount } },
      { new: true }
    );

    // Update original transaction
    await Transaction.findOneAndUpdate(
      { referenceId: payout._id.toString() },
      { status: 'failed', notes: `Rejected: ${adminNotes || 'Declined by Admin'}` }
    );

    // Record explicit refund transaction
    await Transaction.create({
      userId: payout.viewerId,
      type: 'refund',
      amount: payout.amount,
      balanceAfter: updatedUser?.balance || 0,
      status: 'completed',
      referenceId: payout._id.toString(),
      notes: `Refund for rejected payout: ${adminNotes || 'Declined by Admin'}`,
    });

    res.json({ success: true, data: payout, message: 'Payout rejected and funds refunded to user wallet' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/settings - Platform configurations
router.get('/settings', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [usdToBdt, pricingTiers, cooldownSettings] = await Promise.all([
      getSystemExchangeRate(),
      getSystemPricingTiers(),
      getSystemCooldownSettings(),
    ]);
    res.json({
      success: true,
      data: {
        usdToBdt,
        pricingTiers,
        cooldownSettings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/exchange-rate - Update USD to BDT dollar price
router.post('/settings/exchange-rate', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { usdToBdt } = req.body;
    const rate = Number(usdToBdt);
    if (!rate || isNaN(rate) || rate < 10 || rate > 500) {
      res.status(400).json({ success: false, error: 'Please enter a valid dollar exchange rate (between 10 and 500 BDT)' });
      return;
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'usd_to_bdt_rate' },
      { value: rate, description: 'USD to BDT exchange rate' },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: { usdToBdt: updated.value },
      message: `Dollar rate successfully updated to 1 USD = ${updated.value} BDT!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/pricing - Update pricing per view for tiers
router.post('/settings/pricing', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pricingTiers } = req.body;
    if (!pricingTiers || typeof pricingTiers !== 'object') {
      res.status(400).json({ success: false, error: 'Valid pricing tiers object is required' });
      return;
    }

    // Clean and validate tier numbers
    const cleanTiers: Record<number, { campaignerCost: number; viewerReward: number }> = {};
    for (const [secStr, tierObj] of Object.entries(pricingTiers)) {
      const sec = parseInt(secStr, 10);
      const t = tierObj as any;
      if (!isNaN(sec) && sec > 0 && t && typeof t === 'object') {
        const cost = Number(t.campaignerCost);
        const reward = Number(t.viewerReward);
        if (!isNaN(cost) && cost > 0 && !isNaN(reward) && reward >= 0) {
          cleanTiers[sec] = {
            campaignerCost: Number(cost.toFixed(4)),
            viewerReward: Number(reward.toFixed(4)),
          };
        }
      }
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'pricing_tiers' },
      { value: cleanTiers, description: 'Platform pricing tiers per watch duration' },
      { upsert: true, new: true }
    );

    // Sync in-memory config
    Object.assign(config.pricingTiers, cleanTiers);

    res.json({
      success: true,
      data: { pricingTiers: updated.value },
      message: 'Platform pricing tiers updated successfully!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/cooldown - Update cooldown timer & anti-spam rule
router.post('/settings/cooldown', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enableCooldown, videoCooldownSeconds } = req.body;
    const isEnabled = Boolean(enableCooldown);
    const seconds = parseInt(videoCooldownSeconds, 10);

    if (isNaN(seconds) || seconds < 0 || seconds > 86400 * 7) {
      res.status(400).json({ success: false, error: 'Cooldown seconds must be between 0 and 604800 (7 days)' });
      return;
    }

    const cooldownData = {
      enableCooldown: isEnabled,
      videoCooldownSeconds: seconds,
    };

    const updated = await Setting.findOneAndUpdate(
      { key: 'cooldown_settings' },
      { value: cooldownData, description: 'Viewer video anti-spam cooldown settings' },
      { upsert: true, new: true }
    );

    // Sync in-memory config
    config.enableCooldown = isEnabled;
    config.videoCooldownSeconds = seconds;

    res.json({
      success: true,
      data: { cooldownSettings: updated.value },
      message: `Cooldown settings updated! Cooldown is ${isEnabled ? `ENABLED (${seconds}s)` : 'DISABLED'}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const adminRouter = router;

