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

export interface DepositMethodSetting {
  id: string; // 'bkash' | 'nagad' | 'rocket' | 'crypto' | 'faucetpay' | 'webmoney'
  name: string;
  type: 'mobile_banking' | 'crypto' | 'micropayment' | 'e_wallet';
  accountType: string; // 'Personal' | 'Merchant' | 'BEP-20 (BNB Smart Chain)' | 'Email' | 'WMZ Purse'
  accountNumber: string;
  minDepositUsd: number;
  instructions: string;
  enabled: boolean;
}

export const DEFAULT_DEPOSIT_METHODS: DepositMethodSetting[] = [
  {
    id: 'bkash',
    name: 'bKash',
    type: 'mobile_banking',
    accountType: 'Personal',
    accountNumber: '01XXXXXXXXX',
    minDepositUsd: 5.0,
    instructions: 'Send Money (Personal) to this bKash number. Copy the TrxID and enter below.',
    enabled: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    type: 'mobile_banking',
    accountType: 'Personal',
    accountNumber: '01XXXXXXXXX',
    minDepositUsd: 5.0,
    instructions: 'Send Money (Personal) to this Nagad number. Copy the TrxID and enter below.',
    enabled: true,
  },
  {
    id: 'crypto',
    name: 'USDT (BEP-20)',
    type: 'crypto',
    accountType: 'BEP-20 (BNB Smart Chain)',
    accountNumber: '0x0000000000000000000000000000000000000000',
    minDepositUsd: 5.0,
    instructions: 'Send USDT (BEP-20 network only) to this wallet address. Paste the transaction hash below.',
    enabled: true,
  },
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    type: 'micropayment',
    accountType: 'Email / Account',
    accountNumber: 'admin@myyt.com',
    minDepositUsd: 5.0,
    instructions: 'Send payment via FaucetPay to this email/address and enter your FaucetPay TrxID.',
    enabled: true,
  },
  {
    id: 'webmoney',
    name: 'WebMoney (WMZ)',
    type: 'e_wallet',
    accountType: 'WMZ Purse',
    accountNumber: 'Z000000000000',
    minDepositUsd: 5.0,
    instructions: 'Transfer WMZ to this purse and enter the transaction number below.',
    enabled: true,
  },
  {
    id: 'payeer',
    name: 'Payeer',
    type: 'e_wallet',
    accountType: 'USD Account',
    accountNumber: 'P1000000000',
    minDepositUsd: 5.0,
    instructions: 'Transfer USD to this Payeer account (e.g. P1000000000) and enter your Payeer Transaction / Batch ID.',
    enabled: true,
  },
];

export interface WithdrawMethodSetting {
  id: string; // 'bkash' | 'nagad' | 'rocket' | 'crypto' | 'faucetpay' | 'webmoney' | 'payeer'
  name: string;
  type: 'mobile_banking' | 'crypto' | 'micropayment' | 'e_wallet';
  accountType: string;
  minWithdrawUsd: number;
  instructions: string;
  enabled: boolean;
}

export const DEFAULT_WITHDRAW_METHODS: WithdrawMethodSetting[] = [
  {
    id: 'bkash',
    name: 'bKash',
    type: 'mobile_banking',
    accountType: 'Personal / Agent',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be sent to your linked bKash number.',
    enabled: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    type: 'mobile_banking',
    accountType: 'Personal',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be sent to your linked Nagad number.',
    enabled: true,
  },
  {
    id: 'rocket',
    name: 'Rocket',
    type: 'mobile_banking',
    accountType: 'Personal',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be sent to your linked Rocket number.',
    enabled: true,
  },
  {
    id: 'crypto',
    name: 'USDT (BEP-20)',
    type: 'crypto',
    accountType: 'BEP-20 (BNB Smart Chain)',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be disbursed to your linked USDT (BEP-20) address.',
    enabled: true,
  },
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    type: 'micropayment',
    accountType: 'Email / Account',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be sent to your linked FaucetPay email/address.',
    enabled: true,
  },
  {
    id: 'webmoney',
    name: 'WebMoney (WMZ)',
    type: 'e_wallet',
    accountType: 'WMZ Purse',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be transferred to your linked WMZ purse.',
    enabled: true,
  },
  {
    id: 'payeer',
    name: 'Payeer',
    type: 'e_wallet',
    accountType: 'USD Account',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be transferred to your linked Payeer account (P...).',
    enabled: true,
  },
];

export const getSystemDepositMethods = async (): Promise<DepositMethodSetting[]> => {
  try {
    const setting = await Setting.findOne({ key: 'deposit_payment_methods' });
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      const existingIds = new Set(setting.value.map((m: any) => m.id));
      const merged = setting.value.map((m: any) => {
        const def = DEFAULT_DEPOSIT_METHODS.find((d) => d.id === m.id) || m;
        return {
          ...def,
          ...m,
        };
      });
      for (const def of DEFAULT_DEPOSIT_METHODS) {
        if (!existingIds.has(def.id)) {
          merged.push(def);
        }
      }
      return merged;
    }
  } catch {
    // fallback
  }
  return DEFAULT_DEPOSIT_METHODS;
};

export const getSystemWithdrawMethods = async (): Promise<WithdrawMethodSetting[]> => {
  try {
    const setting = await Setting.findOne({ key: 'withdraw_payment_methods' });
    if (setting && Array.isArray(setting.value) && setting.value.length > 0) {
      const existingIds = new Set(setting.value.map((m: any) => m.id));
      const merged = setting.value.map((m: any) => {
        const def = DEFAULT_WITHDRAW_METHODS.find((d) => d.id === m.id) || m;
        return {
          ...def,
          ...m,
        };
      });
      for (const def of DEFAULT_WITHDRAW_METHODS) {
        if (!existingIds.has(def.id)) {
          merged.push(def);
        }
      }
      return merged;
    }
  } catch {
    // fallback
  }
  return DEFAULT_WITHDRAW_METHODS;
};

export const getSystemPricingTiers = async (): Promise<Record<number, { campaignerCost: number; viewerReward: number }>> => {
  try {
    const setting = await Setting.findOne({ key: 'pricing_tiers' });
    if (setting && setting.value && typeof setting.value === 'object') {
      const val = setting.value as Record<string, any>;
      // Check if it has real duration keys (e.g., 8, 16, 45, etc.) and not just array indices
      const numericKeys = Object.keys(val).map((k) => parseInt(k, 10));
      const hasRealDurations = numericKeys.some((k) => [8, 16, 45, 60, 120, 180, 300].includes(k));
      if (hasRealDurations) {
        return {
          ...config.pricingTiers,
          ...val,
        };
      }
    }
  } catch {
    // fallback
  }
  return config.pricingTiers;
};

export const formatPricingTiersList = (tiers: Record<number, { campaignerCost: number; viewerReward: number }>) => {
  return Object.entries(tiers)
    .map(([sec, t]) => ({
      duration: parseInt(sec, 10),
      campaignerCost: Number(t.campaignerCost),
      viewerReward: Number(t.viewerReward),
    }))
    .filter((item) => !isNaN(item.duration) && item.duration > 0)
    .sort((a, b) => a.duration - b.duration);
};

export const getSystemCooldownSettings = async (): Promise<{
  enableCooldown: boolean;
  videoCooldownSeconds: number;
  enabled: boolean;
  durationSeconds: number;
}> => {
  let isEnabled = config.enableCooldown;
  let seconds = config.videoCooldownSeconds;
  try {
    const setting = await Setting.findOne({ key: 'cooldown_settings' });
    if (setting && setting.value && typeof setting.value === 'object') {
      const val = setting.value as any;
      if (typeof val.enableCooldown === 'boolean') isEnabled = val.enableCooldown;
      else if (typeof val.enabled === 'boolean') isEnabled = val.enabled;

      if (typeof val.videoCooldownSeconds === 'number') seconds = val.videoCooldownSeconds;
      else if (typeof val.durationSeconds === 'number') seconds = val.durationSeconds;
    }
  } catch {
    // fallback
  }
  return {
    enableCooldown: isEnabled,
    videoCooldownSeconds: seconds,
    enabled: isEnabled,
    durationSeconds: seconds,
  };
};

export const getSystemDailyLimitSettings = async (): Promise<{
  enableDailyLimit: boolean;
  maxDailyVideos: number;
  enabled: boolean;
  limit: number;
}> => {
  let isEnabled = false;
  let limit = 50;
  try {
    const setting = await Setting.findOne({ key: 'daily_limit_settings' });
    if (setting && setting.value && typeof setting.value === 'object') {
      const val = setting.value as any;
      if (typeof val.enableDailyLimit === 'boolean') isEnabled = val.enableDailyLimit;
      else if (typeof val.enabled === 'boolean') isEnabled = val.enabled;

      if (typeof val.maxDailyVideos === 'number') limit = val.maxDailyVideos;
      else if (typeof val.limit === 'number') limit = val.limit;
    }
  } catch {
    // fallback
  }
  return {
    enableDailyLimit: isEnabled,
    maxDailyVideos: limit,
    enabled: isEnabled,
    limit,
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
    const pendingDepositsCount = await Transaction.countDocuments({ type: 'deposit', status: 'pending' });

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

    const pendingDepositAgg = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingDepositsUsd = Number((pendingDepositAgg[0]?.total || 0).toFixed(2));

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
        pendingDepositsCount,
        pendingDepositsUsd,
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
    const updateData: any = { status };
    if (status === 'paused') {
      updateData.pausedByAdmin = true;
    } else if (status === 'active') {
      updateData.pausedByAdmin = false;
    }
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
    const [usdToBdt, pricingTiers, cooldownSettings, dailyLimitSettings] = await Promise.all([
      getSystemExchangeRate(),
      getSystemPricingTiers(),
      getSystemCooldownSettings(),
      getSystemDailyLimitSettings(),
    ]);

    const pricingTiersList = formatPricingTiersList(pricingTiers);

    res.json({
      success: true,
      data: {
        usdToBdt,
        pricingTiers,
        pricingTiersList,
        cooldownSettings,
        dailyLimitSettings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/exchange-rate - Update USD to BDT dollar price
router.post('/settings/exchange-rate', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { usdToBdt, rate: rawRate } = req.body;
    const val = usdToBdt !== undefined ? usdToBdt : rawRate;
    const rate = Number(val);
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
    if (!pricingTiers || (typeof pricingTiers !== 'object' && !Array.isArray(pricingTiers))) {
      res.status(400).json({ success: false, error: 'Valid pricing tiers array or object is required' });
      return;
    }

    // Clean and validate tier numbers whether submitted as Array or Object
    const cleanTiers: Record<number, { campaignerCost: number; viewerReward: number }> = {};

    if (Array.isArray(pricingTiers)) {
      for (const item of pricingTiers) {
        if (!item || typeof item !== 'object') continue;
        const sec = parseInt(item.duration, 10);
        const cost = Number(item.campaignerCost);
        const reward = Number(item.viewerReward);
        if (!isNaN(sec) && sec > 0 && !isNaN(cost) && cost > 0 && !isNaN(reward) && reward >= 0) {
          cleanTiers[sec] = {
            campaignerCost: Number(cost.toFixed(4)),
            viewerReward: Number(reward.toFixed(4)),
          };
        }
      }
    } else {
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
    }

    if (Object.keys(cleanTiers).length === 0) {
      res.status(400).json({ success: false, error: 'At least one valid pricing tier is required' });
      return;
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'pricing_tiers' },
      { value: cleanTiers, description: 'Platform pricing tiers per watch duration' },
      { upsert: true, new: true }
    );

    // Sync in-memory config
    Object.assign(config.pricingTiers, cleanTiers);

    const pricingTiersList = formatPricingTiersList(cleanTiers);

    res.json({
      success: true,
      data: {
        pricingTiers: updated.value,
        pricingTiersList,
      },
      message: 'Platform pricing tiers updated successfully!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/cooldown - Update cooldown timer & anti-spam rule
router.post('/settings/cooldown', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enableCooldown, videoCooldownSeconds, enabled, durationSeconds } = req.body;
    const isEnabled = enabled !== undefined ? Boolean(enabled) : Boolean(enableCooldown);
    const rawSeconds = durationSeconds !== undefined ? durationSeconds : videoCooldownSeconds;
    const seconds = parseInt(String(rawSeconds), 10);

    if (isNaN(seconds) || seconds < 0 || seconds > 86400 * 7) {
      res.status(400).json({ success: false, error: 'Cooldown seconds must be between 0 and 604800 (7 days)' });
      return;
    }

    const cooldownData = {
      enableCooldown: isEnabled,
      videoCooldownSeconds: seconds,
      enabled: isEnabled,
      durationSeconds: seconds,
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
      data: { cooldownSettings: cooldownData },
      message: `Cooldown settings updated! Cooldown is ${isEnabled ? `ENABLED (${seconds}s)` : 'DISABLED'}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/daily-limit - Set maximum daily videos a viewer can watch
router.post('/settings/daily-limit', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enableDailyLimit, maxDailyVideos, enabled, limit: rawLimit } = req.body;
    const isEnabled = enabled !== undefined ? Boolean(enabled) : Boolean(enableDailyLimit);
    const limitNum = rawLimit !== undefined ? rawLimit : maxDailyVideos;
    const limit = parseInt(String(limitNum), 10);

    if (isNaN(limit) || limit < 0 || limit > 100000) {
      res.status(400).json({ success: false, error: 'Max daily videos must be a valid number between 0 and 100,000' });
      return;
    }

    const limitData = {
      enableDailyLimit: isEnabled,
      maxDailyVideos: limit,
      enabled: isEnabled,
      limit,
    };

    const updated = await Setting.findOneAndUpdate(
      { key: 'daily_limit_settings' },
      { value: limitData, description: 'Viewer daily maximum video watch limit settings' },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: { dailyLimitSettings: limitData },
      message: `Daily watch limit updated! Daily limit is ${isEnabled ? `ACTIVE (${limit} videos/day)` : 'DISABLED (unlimited)'}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/deposits - List deposit requests
router.get('/deposits', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = { type: 'deposit' };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const deposits = await Transaction.find(filter)
      .populate('userId', 'name email balance creatorBalance')
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ success: true, data: deposits });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/deposits/:id/approve - Approve deposit and credit user's creator ad budget
router.post('/deposits/:id/approve', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNotes } = req.body;
    const tx = await Transaction.findOne({ _id: req.params.id, type: 'deposit' });

    if (!tx) {
      res.status(404).json({ success: false, error: 'Deposit transaction not found' });
      return;
    }

    if (tx.status !== 'pending') {
      res.status(400).json({ success: false, error: `Deposit is already marked as ${tx.status}` });
      return;
    }

    // Atomic credit to creator ad budget and overall cash balance
    const updatedUser = await User.findByIdAndUpdate(
      tx.userId,
      { $inc: { creatorBalance: tx.amount, balance: tx.amount } },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    tx.status = 'completed';
    tx.balanceAfter = updatedUser.balance;
    tx.adminNotes = adminNotes || 'Manually approved and credited by Admin';
    tx.processedAt = new Date();
    await tx.save();

    res.json({
      success: true,
      data: {
        transaction: tx,
        user: {
          id: updatedUser._id,
          balance: updatedUser.balance,
          creatorBalance: updatedUser.creatorBalance,
        },
      },
      message: `Deposit of $${tx.amount.toFixed(2)} USD approved and credited successfully!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/deposits/:id/reject - Reject deposit
router.post('/deposits/:id/reject', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNotes } = req.body;
    const tx = await Transaction.findOne({ _id: req.params.id, type: 'deposit' });

    if (!tx) {
      res.status(404).json({ success: false, error: 'Deposit transaction not found' });
      return;
    }

    if (tx.status !== 'pending') {
      res.status(400).json({ success: false, error: `Deposit is already marked as ${tx.status}` });
      return;
    }

    tx.status = 'failed';
    tx.adminNotes = adminNotes || 'Declined by Admin (Invalid transaction ID or payment not received)';
    tx.processedAt = new Date();
    await tx.save();

    res.json({
      success: true,
      data: tx,
      message: `Deposit request marked as rejected.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/settings/deposit-methods - Get deposit methods configuration
router.get('/settings/deposit-methods', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const methods = await getSystemDepositMethods();
    res.json({ success: true, data: methods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/deposit-methods - Update deposit payment methods and numbers
router.post('/settings/deposit-methods', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { methods } = req.body;
    if (!methods || !Array.isArray(methods)) {
      res.status(400).json({ success: false, error: 'An array of payment methods is required' });
      return;
    }

    // Sanitize and validate methods
    const sanitizedMethods: DepositMethodSetting[] = methods.map((m: any) => ({
      id: String(m.id || '').trim(),
      name: String(m.name || '').trim(),
      type: m.type || 'mobile_banking',
      accountType: String(m.accountType || '').trim(),
      accountNumber: String(m.accountNumber || '').trim(),
      minDepositUsd: typeof m.minDepositUsd === 'number' && m.minDepositUsd > 0 ? m.minDepositUsd : 5.0,
      instructions: String(m.instructions || '').trim(),
      enabled: Boolean(m.enabled !== false),
    })).filter((m) => m.id && m.name);

    if (sanitizedMethods.length === 0) {
      res.status(400).json({ success: false, error: 'At least one valid payment method is required' });
      return;
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'deposit_payment_methods' },
      { value: sanitizedMethods, description: 'Deposit payment methods and receiver numbers' },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: updated.value,
      message: 'Deposit payment methods and receiver numbers updated successfully!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/settings/withdraw-methods - Get current withdrawal methods & min limit config
router.get('/settings/withdraw-methods', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const methods = await getSystemWithdrawMethods();
    res.json({ success: true, data: methods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/withdraw-methods - Update withdrawal payment methods and minimum payout amounts
router.post('/settings/withdraw-methods', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { methods } = req.body;
    if (!methods || !Array.isArray(methods)) {
      res.status(400).json({ success: false, error: 'An array of withdrawal methods is required' });
      return;
    }

    // Sanitize and validate methods
    const sanitizedMethods: WithdrawMethodSetting[] = methods.map((m: any) => ({
      id: String(m.id || '').trim(),
      name: String(m.name || '').trim(),
      type: m.type || 'mobile_banking',
      accountType: String(m.accountType || '').trim(),
      minWithdrawUsd: typeof m.minWithdrawUsd === 'number' && m.minWithdrawUsd > 0 ? m.minWithdrawUsd : 5.0,
      instructions: String(m.instructions || '').trim(),
      enabled: Boolean(m.enabled !== false),
    })).filter((m) => m.id && m.name);

    if (sanitizedMethods.length === 0) {
      res.status(400).json({ success: false, error: 'At least one valid withdrawal method is required' });
      return;
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'withdraw_payment_methods' },
      { value: sanitizedMethods, description: 'Withdrawal payment methods and minimum payout amounts' },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: updated.value,
      message: 'Withdrawal payment methods and minimum payout amounts updated successfully!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const adminRouter = router;



