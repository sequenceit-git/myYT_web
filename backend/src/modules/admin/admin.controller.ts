import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';
import { Campaign } from '../../models/Campaign.js';
import { Payout } from '../../models/Payout.js';
import { Transaction } from '../../models/Transaction.js';
import { Task } from '../../models/Task.js';
import { Setting } from '../../models/Setting.js';
import { requireAdmin, requireMasterAdmin, requireAdminPermission, AuthRequest } from '../../middleware/auth.middleware.js';
import { config } from '../../config/index.js';
import {
  parseBrowserFromUserAgent,
  parsePlatformFromUserAgent,
  parseDeviceModelFromUserAgent,
} from '../../services/telemetry.service.js';
import { phoneTracker } from '../../services/phoneTracker.service.js';

function formatSubAdmin(user: any) {
  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    adminRole: user.adminRole || 'sub_admin',
    adminPermissions: user.adminPermissions || [],
    status: user.status || 'active',
    createdAt: user.createdAt,
    avatar: user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=b6e3f4`,
  };
}

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
    accountNumber: 'admin@ytcash.com',
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
    const setting = await Setting.findOne({ key: 'pricing_tiers' }).lean();
    if (setting && setting.value && typeof setting.value === 'object') {
      const val = setting.value as Record<string, any>;
      const tiersMap: Record<number, { campaignerCost: number; viewerReward: number }> = {};

      if (Array.isArray(val)) {
        for (const item of val) {
          const sec = parseInt(item.duration, 10);
          if (!isNaN(sec) && sec > 0) {
            tiersMap[sec] = {
              campaignerCost: Number(item.campaignerCost || 0),
              viewerReward: Number(item.viewerReward || 0),
            };
          }
        }
      } else {
        for (const [secStr, item] of Object.entries(val)) {
          const sec = parseInt(secStr, 10);
          if (!isNaN(sec) && sec > 0 && item && typeof item === 'object') {
            tiersMap[sec] = {
              campaignerCost: Number(item.campaignerCost || 0),
              viewerReward: Number(item.viewerReward || 0),
            };
          }
        }
      }

      if (Object.keys(tiersMap).length > 0) {
        return {
          ...config.pricingTiers,
          ...tiersMap,
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

export const getSystemHourlyLimitSettings = async (): Promise<{
  enableHourlyLimit: boolean;
  maxHourlyVideos: number;
  enabled: boolean;
  limit: number;
}> => {
  let isEnabled = false;
  let limit = 20;
  try {
    const setting = await Setting.findOne({ key: 'hourly_limit_settings' });
    if (setting && setting.value && typeof setting.value === 'object') {
      const val = setting.value as any;
      if (typeof val.enableHourlyLimit === 'boolean') isEnabled = val.enableHourlyLimit;
      else if (typeof val.enabled === 'boolean') isEnabled = val.enabled;

      if (typeof val.maxHourlyVideos === 'number') limit = val.maxHourlyVideos;
      else if (typeof val.limit === 'number') limit = val.limit;
    }
  } catch {
    // fallback
  }
  return {
    enableHourlyLimit: isEnabled,
    maxHourlyVideos: limit,
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
        phoneAppActiveUsers: await phoneTracker.getCombinedActiveCount(),
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

// GET /api/admin/active-phone-users - Real-time active phone app concurrency count
router.get('/active-phone-users', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activeCount = await phoneTracker.getCombinedActiveCount();
    res.json({
      success: true,
      data: {
        activeCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/users - User management list (Master Admin Only, excluding sub-admins)
router.get('/users', requireMasterAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({ adminRole: { $ne: 'sub_admin' } }).sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/users/:id/status - Ban or unban user (Master Admin Only)
router.post('/users/:id/status', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
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

// POST /api/admin/users/:id/reset-device - Reset user's mobile device binding (Master Admin Only)
router.post('/users/:id/reset-device', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    user.activeMobileDeviceId = undefined;
    user.activeMobileDeviceModel = undefined;
    user.lastMobileActiveAt = undefined;
    await user.save();

    res.json({ success: true, message: 'User mobile device lock has been reset successfully', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/campaigns - List all campaigns
router.get('/campaigns', requireAdminPermission('campaigns'), async (_req: AuthRequest, res: Response): Promise<void> => {
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
router.post('/campaigns/:id/status', requireAdminPermission('campaigns'), async (req: AuthRequest, res: Response): Promise<void> => {
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

// DELETE /api/admin/campaigns/:id - Delete campaign
router.delete('/campaigns/:id', requireAdminPermission('campaigns'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      res.status(404).json({ success: false, error: 'Campaign not found' });
      return;
    }
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/payouts - List withdrawal queue
router.get('/payouts', requireAdminPermission('withdrawals'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const rawPayouts = await Payout.find(filter)
      .populate('viewerId', 'name email balance viewerBalance totalEarned totalWithdrawn')
      .sort({ createdAt: -1 })
      .limit(500);

    const payouts = rawPayouts.map((p) => {
      const obj = p.toObject() as any;
      const ua = obj.userAgent || 'Unknown Client';
      if (!obj.browser) obj.browser = parseBrowserFromUserAgent(ua);
      if (!obj.platform) obj.platform = obj.clientPlatform || parsePlatformFromUserAgent(ua);
      if (!obj.deviceName) obj.deviceName = obj.deviceInfo || parseDeviceModelFromUserAgent(ua);
      if (!obj.country) obj.country = 'Bangladesh';
      if (!obj.rejectionReason && obj.status === 'rejected') {
        obj.rejectionReason = obj.adminNotes || 'Rejected by Admin';
      }
      return obj;
    });

    res.json({ success: true, data: payouts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/payouts/:id/approve - Approve withdrawal
router.post('/payouts/:id/approve', requireAdminPermission('withdrawals'), async (req: AuthRequest, res: Response): Promise<void> => {
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

// POST /api/admin/payouts/:id/reject - Reject withdrawal and refund viewer
router.post('/payouts/:id/reject', requireAdminPermission('withdrawals'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNotes, rejectionReason } = req.body;
    const reasonText = rejectionReason || adminNotes || 'Declined by Administrator (Invalid account or policy issue)';
    const payout = await Payout.findById(req.params.id);
    if (!payout || payout.status !== 'pending') {
      res.status(400).json({ success: false, error: 'Payout not found or not in pending state' });
      return;
    }

    payout.status = 'rejected';
    payout.adminNotes = reasonText;
    payout.rejectionReason = reasonText;
    payout.processedAt = new Date();
    await payout.save();

    // Check whether payout was requested from creator budget or viewer earnings
    const isCreatorPayout = payout.sourceBalance === 'creator';
    const refundRole = isCreatorPayout ? 'creator' : 'viewer';

    // Atomic refund back to user wallet (creatorBalance or viewerBalance) and reverse totalWithdrawn
    const updatedUser = await User.findByIdAndUpdate(
      payout.viewerId,
      isCreatorPayout
        ? { $inc: { balance: payout.amount, creatorBalance: payout.amount, totalWithdrawn: -payout.amount } }
        : { $inc: { balance: payout.amount, viewerBalance: payout.amount, totalWithdrawn: -payout.amount } },
      { new: true }
    );

    // Update original transaction
    await Transaction.findOneAndUpdate(
      { referenceId: payout._id.toString() },
      { status: 'failed', notes: `Rejected: ${reasonText}` }
    );

    // Record explicit refund transaction with proper role
    await Transaction.create({
      userId: payout.viewerId,
      role: refundRole,
      type: 'refund',
      amount: payout.amount,
      balanceAfter: isCreatorPayout
        ? (updatedUser?.creatorBalance !== undefined ? updatedUser.creatorBalance : updatedUser?.balance || 0)
        : (updatedUser?.viewerBalance !== undefined ? updatedUser.viewerBalance : updatedUser?.balance || 0),
      status: 'completed',
      referenceId: payout._id.toString(),
      notes: `Refund for rejected ${isCreatorPayout ? 'Creator Budget' : 'Viewer'} payout: ${reasonText}`,
    });

    res.json({ success: true, data: payout, message: 'Payout rejected and funds refunded to user wallet' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/settings - Platform configurations
router.get('/settings', requireMasterAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [usdToBdt, pricingTiers, cooldownSettings, dailyLimitSettings, hourlyLimitSettings] = await Promise.all([
      getSystemExchangeRate(),
      getSystemPricingTiers(),
      getSystemCooldownSettings(),
      getSystemDailyLimitSettings(),
      getSystemHourlyLimitSettings(),
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
        hourlyLimitSettings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/exchange-rate - Update USD to BDT dollar price
router.post('/settings/exchange-rate', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
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

// POST /api/admin/settings/pricing - Update pricing tiers matrix
router.post('/settings/pricing', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
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
            campaignerCost: Number(cost.toFixed(10)),
            viewerReward: Number(reward.toFixed(10)),
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
              campaignerCost: Number(cost.toFixed(10)),
              viewerReward: Number(reward.toFixed(10)),
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

    // Sync in-memory config cleanly
    for (const key of Object.keys(config.pricingTiers)) {
      delete config.pricingTiers[Number(key)];
    }
    Object.assign(config.pricingTiers, cleanTiers);

    const pricingTiersList = formatPricingTiersList(cleanTiers);

    res.json({
      success: true,
      data: {
        pricingTiers: updated?.value || cleanTiers,
        pricingTiersList,
      },
      message: 'Platform pricing tiers updated successfully!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/cooldown - Update cooldown toggle & duration
router.post('/settings/cooldown', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
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

// POST /api/admin/settings/daily-limit - Update daily view limits
router.post('/settings/daily-limit', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
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

// POST /api/admin/settings/hourly-limit - Update hourly limits
router.post('/settings/hourly-limit', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enableHourlyLimit, maxHourlyVideos, enabled, limit: rawLimit } = req.body;
    const isEnabled = enabled !== undefined ? Boolean(enabled) : Boolean(enableHourlyLimit);
    const limitNum = rawLimit !== undefined ? rawLimit : maxHourlyVideos;
    const limit = parseInt(String(limitNum), 10);

    if (isNaN(limit) || limit < 0 || limit > 10000) {
      res.status(400).json({ success: false, error: 'Max hourly videos must be a valid number between 0 and 10,000' });
      return;
    }

    const limitData = {
      enableHourlyLimit: isEnabled,
      maxHourlyVideos: limit,
      enabled: isEnabled,
      limit,
    };

    const updated = await Setting.findOneAndUpdate(
      { key: 'hourly_limit_settings' },
      { value: limitData, description: 'Viewer hourly maximum video watch limit settings' },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: { hourlyLimitSettings: limitData },
      message: `Hourly watch limit updated! Hourly limit is ${isEnabled ? `ACTIVE (${limit} videos/hour)` : 'DISABLED (unlimited)'}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/deposits - List deposit requests
router.get('/deposits', requireAdminPermission('deposits'), async (req: AuthRequest, res: Response): Promise<void> => {
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
router.post('/deposits/:id/approve', requireAdminPermission('deposits'), async (req: AuthRequest, res: Response): Promise<void> => {
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
router.post('/deposits/:id/reject', requireAdminPermission('deposits'), async (req: AuthRequest, res: Response): Promise<void> => {
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
router.get('/settings/deposit-methods', requireMasterAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const methods = await getSystemDepositMethods();
    res.json({ success: true, data: methods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/deposit-methods - Update deposit payment methods and numbers
router.post('/settings/deposit-methods', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
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
router.get('/settings/withdraw-methods', requireMasterAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const methods = await getSystemWithdrawMethods();
    res.json({ success: true, data: methods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/settings/withdraw-methods - Update withdrawal payment methods and minimum payout amounts
router.post('/settings/withdraw-methods', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
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

// ==========================================
// SUB-ADMIN ROLE DELEGATION & MANAGEMENT
// ==========================================

// GET /api/admin/sub-admins - List all delegated sub-admins (Master Admin Only)
router.get('/sub-admins', requireMasterAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subAdmins = await User.find({ role: 'admin', adminRole: 'sub_admin' })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subAdmins.map(formatSubAdmin),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/sub-admins - Create new sub-admin with selected modules (Master Admin Only)
router.post('/sub-admins', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ success: false, error: 'Staff full name is required (min 2 characters)' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'A valid email address is required' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ success: false, error: 'Staff password must be at least 6 characters' });
      return;
    }

    // Sanitize permissions: deposits, withdrawals, campaigns
    const allowedModules = ['deposits', 'withdrawals', 'campaigns'];
    const validPermissions = Array.isArray(permissions)
      ? permissions.filter((p: string) => allowedModules.includes(p))
      : [];

    if (validPermissions.length === 0) {
      res.status(400).json({ success: false, error: 'Please select at least one module (Deposits, Withdrawals, or Campaigns)' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      res.status(400).json({ success: false, error: 'An account with this email address already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newSubAdmin = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'admin',
      adminRole: 'sub_admin',
      adminPermissions: validPermissions,
      status: 'active',
      balance: 0,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
    });

    res.json({
      success: true,
      data: formatSubAdmin(newSubAdmin),
      message: `Sub-admin "${newSubAdmin.name}" created successfully with access to ${validPermissions.join(', ')}!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/sub-admins/:id - Update sub-admin permissions or access status (Master Admin Only)
router.put('/sub-admins/:id', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, permissions, status, password } = req.body;
    const subAdmin = await User.findOne({ _id: req.params.id, role: 'admin', adminRole: 'sub_admin' });

    if (!subAdmin) {
      res.status(404).json({ success: false, error: 'Sub-admin not found' });
      return;
    }

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      subAdmin.name = name.trim();
    }

    if (permissions && Array.isArray(permissions)) {
      const allowedModules = ['deposits', 'withdrawals', 'campaigns'];
      const validPermissions = permissions.filter((p: string) => allowedModules.includes(p));
      if (validPermissions.length === 0) {
        res.status(400).json({ success: false, error: 'Sub-admin must have at least one module assigned' });
        return;
      }
      subAdmin.adminPermissions = validPermissions;
    }

    if (status && ['active', 'suspended'].includes(status)) {
      subAdmin.status = status;
    }

    if (password && typeof password === 'string' && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      subAdmin.passwordHash = await bcrypt.hash(password, salt);
    }

    await subAdmin.save();

    res.json({
      success: true,
      data: formatSubAdmin(subAdmin),
      message: `Sub-admin "${subAdmin.name}" updated successfully!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/sub-admins/:id - Remove sub-admin account (Master Admin Only)
router.delete('/sub-admins/:id', requireMasterAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subAdmin = await User.findOneAndDelete({ _id: req.params.id, role: 'admin', adminRole: 'sub_admin' });
    if (!subAdmin) {
      res.status(404).json({ success: false, error: 'Sub-admin not found' });
      return;
    }

    res.json({
      success: true,
      message: `Sub-admin "${subAdmin.name}" has been deleted.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const adminRouter = router;



