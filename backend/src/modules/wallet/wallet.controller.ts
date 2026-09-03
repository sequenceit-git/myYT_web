import { Router, Response } from 'express';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { Transaction } from '../../models/Transaction.js';
import { Payout } from '../../models/Payout.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware.js';

const router = Router();

const withdrawSchema = z.object({
  amount: z.number().min(5, 'Minimum withdrawal is $5.00 USD'),
  method: z.enum(['bkash', 'nagad', 'crypto', 'faucetpay', 'webmoney']),
  accountDetails: z.string().min(3, 'Valid account details / number required'),
});

const depositSchema = z.object({
  amount: z.number().min(5, 'Minimum deposit is $5.00 USD'),
  gateway: z.enum(['faucetpay', 'crypto', 'bkash', 'nagad']),
  txHash: z.string().optional(),
});

// POST /api/wallet/deposit - Instant deposit handler (FaucetPay / Crypto)
router.post('/deposit', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const { amount, gateway, txHash } = parsed.data;

    // Atomic balance credit (Creator Ad Budget)
    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      { $inc: { creatorBalance: amount, balance: amount } },
      { new: true }
    );

    const transaction = await Transaction.create({
      userId: req.user!._id,
      type: 'deposit',
      amount,
      balanceAfter: updatedUser?.balance || 0,
      status: 'completed',
      gateway,
      referenceId: txHash || `DEP-${Date.now()}`,
      notes: `Instant deposit via ${gateway.toUpperCase()}`,
    });

    res.json({
      success: true,
      data: {
        newBalance: updatedUser?.balance,
        creatorBalance: updatedUser?.creatorBalance,
        transaction,
        message: `Deposit of $${amount.toFixed(2)} credited successfully!`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/wallet/withdraw - Request manual payout (bKash, Nagad, etc.)
router.post('/withdraw', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = withdrawSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const { amount, method, accountDetails } = parsed.data;

    // Atomic balance check & deduction (Viewer Earnings)
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user!._id,
        $or: [
          { viewerBalance: { $gte: amount } },
          { viewerBalance: { $exists: false }, balance: { $gte: amount } },
        ],
      },
      { $inc: { viewerBalance: -amount, totalWithdrawn: amount, balance: -amount } },
      { new: true }
    );

    if (!updatedUser) {
      const avail = req.user!.viewerBalance !== undefined ? req.user!.viewerBalance : req.user!.balance;
      res.status(400).json({
        success: false,
        error: `Insufficient viewer balance ($${avail.toFixed(4)} available) for withdrawal of $${amount.toFixed(2)}`,
      });
      return;
    }

    const payout = await Payout.create({
      viewerId: req.user!._id,
      amount,
      method,
      accountDetails,
      status: 'pending',
    });

    await Transaction.create({
      userId: req.user!._id,
      type: 'payout',
      amount: -amount,
      balanceAfter: updatedUser.balance,
      status: 'pending',
      gateway: method as any,
      referenceId: payout._id.toString(),
      notes: `Withdrawal request to ${method.toUpperCase()}: ${accountDetails}`,
    });

    res.status(201).json({
      success: true,
      data: {
        payout,
        newBalance: updatedUser.balance,
        message: 'Withdrawal request submitted! Admin will review and disburse your payment.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/wallet/convert-credits - Convert accumulated Watch Credits to USD Cash Funds
router.post('/convert-credits', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { credits } = req.body;
    const creditsToConvert = Math.floor(Number(credits));

    if (!creditsToConvert || creditsToConvert < 100) {
      res.status(400).json({ success: false, error: 'Minimum conversion amount is 100 Credits ($0.10 USD)' });
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user || (user.credits || 0) < creditsToConvert) {
      res.status(400).json({
        success: false,
        error: `Insufficient watch credits. You have ${user?.credits || 0} Credits available.`,
      });
      return;
    }

    // Conversion rate: 1,000 Credits = $1.0000 USD (1 credit = $0.001)
    const usdAmount = Number((creditsToConvert * 0.001).toFixed(4));

    user.credits -= creditsToConvert;
    user.balance += usdAmount;
    user.totalEarned = (user.totalEarned || 0) + usdAmount;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'credit_conversion',
      amount: usdAmount,
      balanceAfter: user.balance,
      status: 'completed',
      notes: `Converted ${creditsToConvert.toLocaleString()} Watch Credits to $${usdAmount.toFixed(4)} USD Funds`,
    });

    res.json({
      success: true,
      data: {
        convertedCredits: creditsToConvert,
        usdAdded: usdAmount,
        newCredits: user.credits,
        newBalance: user.balance,
        transaction,
        message: `✓ Successfully converted ${creditsToConvert.toLocaleString()} Credits to $${usdAmount.toFixed(2)} USD!`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wallet/transactions - User's financial history
router.get('/transactions', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ userId: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wallet/payouts/live - Public recent approved payouts for social proof
router.get('/payouts/live', async (_req, res) => {
  try {
    const recentPayouts = await Payout.find({ status: 'approved' })
      .populate('viewerId', 'name email')
      .sort({ processedAt: -1, createdAt: -1 })
      .limit(10);

    const formatted = recentPayouts.map((p: any) => {
      const email = p.viewerId?.email || 'user@example.com';
      const maskedEmail = email.replace(/(.{2})(.*)(?=@)/, '$1***');
      return {
        id: p._id,
        user: maskedEmail,
        amount: p.amount,
        method: p.method,
        date: p.processedAt || p.createdAt,
        status: p.status,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const walletRouter = router;
