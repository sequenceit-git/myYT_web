import { Router, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Campaign } from '../../models/Campaign.js';
import { User } from '../../models/User.js';
import { Transaction } from '../../models/Transaction.js';
import { config } from '../../config/index.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware.js';

const router = Router();

// Helper to extract YouTube video ID from various link formats
export const extractYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const createCampaignSchema = z.object({
  youtubeUrl: z.string().url(),
  targetViews: z.number().int().min(100).max(500000),
  watchDurationSec: z.number().int().positive(),
  title: z.string().optional(),
});

// Price calculator endpoint
router.get('/calculate-price', (req, res) => {
  const duration = parseInt(req.query.duration as string, 10);
  const views = parseInt(req.query.views as string, 10);

  if (!config.pricingTiers[duration] || !views || views < 10) {
    res.status(400).json({ success: false, error: 'Invalid duration or views' });
    return;
  }

  const rate = config.pricingTiers[duration].campaignerCost;
  const totalCost = Number((rate * views).toFixed(4));

  res.json({
    success: true,
    data: {
      duration,
      views,
      pricePerView: rate,
      totalCost,
    },
  });
});

// Create campaign & deduct balance atomically
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const { youtubeUrl, targetViews, watchDurationSec, title } = parsed.data;
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      res.status(400).json({ success: false, error: 'Invalid YouTube URL or could not parse video ID' });
      return;
    }

    const tier = config.pricingTiers[watchDurationSec];
    const totalCost = Number((tier.campaignerCost * targetViews).toFixed(4));

    // Atomic balance deduction (Creator Ad Budget)
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user!._id, balance: { $gte: totalCost } },
      { $inc: { creatorBalance: -totalCost, balance: -totalCost, totalSpent: totalCost } },
      { new: true }
    );

    if (!updatedUser) {
      res.status(400).json({
        success: false,
        error: `Insufficient balance ($${req.user!.balance.toFixed(2)}). Total required is $${totalCost.toFixed(2)}. Please deposit first.`,
      });
      return;
    }

    const campaign = await Campaign.create({
      ownerId: req.user!._id,
      title: title || `YouTube Promotion (${videoId})`,
      youtubeUrl,
      videoId,
      targetViews,
      watchDurationSec,
      pricePerView: tier.campaignerCost,
      totalCost,
      status: 'active',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });

    // Record Transaction
    await Transaction.create({
      userId: req.user!._id,
      type: 'campaign_spend',
      amount: -totalCost,
      balanceAfter: updatedUser.balance,
      status: 'completed',
      referenceId: campaign._id.toString(),
      notes: `Order for ${targetViews} views at ${watchDurationSec}s duration`,
    });

    res.status(201).json({
      success: true,
      data: {
        campaign,
        newBalance: updatedUser.balance,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List user's campaigns
router.get('/mine', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find({ ownerId: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pause campaign
router.post('/:id/pause', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user!._id, status: 'active' },
      { status: 'paused' },
      { new: true }
    );
    if (!campaign) {
      res.status(404).json({ success: false, error: 'Active campaign not found' });
      return;
    }
    res.json({ success: true, data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resume campaign
router.post('/:id/resume', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user!._id, status: 'paused' },
      { status: 'active' },
      { new: true }
    );
    if (!campaign) {
      res.status(404).json({ success: false, error: 'Paused campaign not found' });
      return;
    }
    res.json({ success: true, data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const campaignsRouter = router;
