import { Router, Response } from 'express';
import { User } from '../../models/User.js';
import { Campaign } from '../../models/Campaign.js';
import { Payout } from '../../models/Payout.js';
import { Transaction } from '../../models/Transaction.js';
import { Task } from '../../models/Task.js';
import { requireAdmin, AuthRequest } from '../../middleware/auth.middleware.js';

const router = Router();

// GET /api/admin/stats - Platform overview
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

    res.json({
      success: true,
      data: {
        totalUsers,
        activeCampaigns,
        totalCampaigns,
        totalTasksCompleted,
        totalViewsDelivered,
        pendingPayoutsCount,
        simulatedConcurrency: Math.floor(4100 + Math.random() * 450), // Realistic 4k-5k active live concurrency metric
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
router.get('/payouts', requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payouts = await Payout.find()
      .populate('viewerId', 'name email balance')
      .sort({ createdAt: -1 })
      .limit(100);
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
    payout.adminNotes = adminNotes || 'Disbursed by Admin';
    payout.processedAt = new Date();
    await payout.save();

    // Increment user's totalWithdrawn
    await User.findByIdAndUpdate(payout.viewerId, { $inc: { totalWithdrawn: payout.amount } });

    // Update corresponding transaction status
    await Transaction.findOneAndUpdate(
      { referenceId: payout._id.toString() },
      { status: 'completed', notes: `Paid via ${payout.method.toUpperCase()} (Ref: ${payout.transactionRef})` }
    );

    res.json({ success: true, data: payout, message: 'Payout approved successfully' });
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

    // Atomic refund back to user wallet
    const updatedUser = await User.findByIdAndUpdate(
      payout.viewerId,
      { $inc: { balance: payout.amount } },
      { new: true }
    );

    // Record refund transaction
    await Transaction.create({
      userId: payout.viewerId,
      type: 'refund',
      amount: payout.amount,
      balanceAfter: updatedUser?.balance || 0,
      status: 'completed',
      referenceId: payout._id.toString(),
      notes: `Refund for rejected payout: ${adminNotes || 'Declined'}`,
    });

    res.json({ success: true, data: payout, message: 'Payout rejected and balance refunded to user' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const adminRouter = router;
