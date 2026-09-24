import { Router, Response } from 'express';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { Transaction } from '../../models/Transaction.js';
import { Payout } from '../../models/Payout.js';
import { Task } from '../../models/Task.js';
import { Campaign } from '../../models/Campaign.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware.js';
import { getSystemDepositMethods, getSystemWithdrawMethods } from '../admin/admin.controller.js';
import { extractFullClientTelemetry } from '../../services/telemetry.service.js';
import { config } from '../../config/index.js';

const router = Router();

const withdrawSchema = z.object({
  amount: z.number().positive('Withdrawal amount must be greater than 0'),
  method: z.enum(['bkash', 'nagad', 'rocket', 'crypto', 'faucetpay', 'webmoney', 'payeer']),
  accountDetails: z.string().min(3, 'Valid account details / number required'),
  sourceBalance: z.enum(['viewer', 'creator']).optional(),
  deviceInfo: z.string().optional(),
  country: z.string().optional(),
  browser: z.string().optional(),
  platform: z.string().optional(),
  deviceName: z.string().optional(),
  timezone: z.string().optional(),
});

const depositSchema = z.object({
  amount: z.number().positive('Deposit amount must be greater than 0'),
  gateway: z.enum(['faucetpay', 'crypto', 'bkash', 'nagad', 'rocket', 'webmoney', 'payeer']),
  senderAccount: z.string().min(2, 'Sender account / phone / wallet address is required'),
  transactionHash: z.string().optional().nullable(),
  notes: z.string().optional(),
  proofImage: z.string().optional(),
});

// GET /api/wallet/deposit-methods - Public/Authenticated available deposit options
router.get('/deposit-methods', async (_req, res: Response): Promise<void> => {
  try {
    const methods = await getSystemDepositMethods();
    res.json({ success: true, data: methods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wallet/withdraw-methods - Public/Authenticated available withdrawal options & limits
router.get('/withdraw-methods', async (_req, res: Response): Promise<void> => {
  try {
    const methods = await getSystemWithdrawMethods();
    res.json({ success: true, data: methods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/wallet/deposit - Submit a manual deposit request
router.post('/deposit', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const { amount, gateway, senderAccount, transactionHash, notes, proofImage } = parsed.data;

    // Verify method is enabled by administrator
    const systemMethods = await getSystemDepositMethods();
    const targetMethod = systemMethods.find((m) => m.id === gateway);
    if (targetMethod && targetMethod.enabled === false) {
      res.status(400).json({
        success: false,
        error: `${targetMethod.name} deposits are currently disabled by the administrator.`,
      });
      return;
    }

    // Check duplicate transaction hash to prevent duplicate manual deposits (only if transactionHash provided)
    const cleanTxHash = transactionHash ? transactionHash.trim() : '';
    if (cleanTxHash) {
      const existingTx = await Transaction.findOne({
        gateway: gateway as any,
        referenceId: cleanTxHash,
      });

      if (existingTx) {
        res.status(400).json({
          success: false,
          error: 'This Transaction ID has already been submitted. If your balance is not updated, please contact support.',
        });
        return;
      }
    }

    const transaction = await Transaction.create({
      userId: req.user!._id,
      role: 'creator',
      type: 'deposit',
      amount,
      balanceAfter: req.user!.creatorBalance !== undefined ? req.user!.creatorBalance : req.user!.balance,
      status: 'pending',
      gateway: gateway as any,
      senderAccount: senderAccount.trim(),
      referenceId: cleanTxHash || undefined,
      notes: notes?.trim() || `Manual deposit via ${gateway.toUpperCase()}`,
      proofImage,
    });

    res.status(201).json({
      success: true,
      data: {
        transaction,
        message: 'Deposit request submitted successfully! Funds will be credited once verified by admin.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// FAUCETPAY AUTOMATED CRYPTO DEPOSIT SYSTEM
// =============================================================================

// POST /api/wallet/faucetpay-create-order - Create pending crypto order & get checkout params
router.post('/faucetpay-create-order', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    // Verify Crypto gateway is enabled by admin in system settings
    const systemMethods = await getSystemDepositMethods();
    const cryptoMethod = systemMethods.find((m) => m.id === 'crypto');
    if (cryptoMethod && cryptoMethod.enabled === false) {
      res.status(400).json({ success: false, error: 'Automatic crypto deposits are currently turned OFF by the administrator.' });
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ success: false, error: 'Deposit amount must be greater than 0' });
      return;
    }

    const user = req.user!;
    const merchantUsername = (config.faucetpayMerchantUsername || process.env.FAUCETPAY_MERCHANT_USERNAME || '').trim();
    const hasApiKey = Boolean((config.faucetpayApiKey || process.env.FAUCETPAY_API_KEY || '').trim());

    // Generate unique internal order reference ID
    const referenceId = `FP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create pending deposit transaction in DB
    const transaction = await Transaction.create({
      userId: user._id,
      role: 'creator',
      type: 'deposit',
      amount: numAmount,
      balanceAfter: user.creatorBalance !== undefined ? user.creatorBalance : user.balance,
      status: 'pending',
      gateway: 'crypto',
      referenceId,
      notes: 'Automated Crypto Deposit via FaucetPay (Awaiting Payment)',
    });

    const publicOrigin = (config.corsOrigin || 'https://ytcash.pro').split(',')[0].trim().replace(/\/$/, '');

    // Prepare parameters for FaucetPay Merchant Checkout
    const formParams = {
      action: 'https://faucetpay.io/merchant/webscr',
      merchant_username: merchantUsername,
      item_description: `ytCash Crypto Deposit ($${numAmount.toFixed(2)} USD)`,
      amount1: numAmount.toFixed(2),
      currency1: 'USD',
      currency2: '', // Empty allows buyer to choose Bitcoin, Ethereum, USDT, Litecoin, Dogecoin, Tron, etc.
      custom: transaction._id.toString(),
      callback_url: `${publicOrigin}/api/wallet/faucetpay-callback`,
      success_url: `${publicOrigin}/creator?tab=deposit&status=success&orderId=${transaction._id}`,
      cancel_url: `${publicOrigin}/creator?tab=deposit&status=cancelled`,
    };

    res.json({
      success: true,
      data: {
        transactionId: transaction._id,
        referenceId,
        amount: numAmount,
        formParams,
        isConfigured: Boolean(merchantUsername || hasApiKey),
      },
    });
  } catch (error: any) {
    console.error('[FaucetPay Create Order] Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Error generating crypto deposit order' });
  }
});

// POST /api/wallet/faucetpay-callback - IPN Webhook callback from FaucetPay
router.post('/faucetpay-callback', async (req, res: Response): Promise<void> => {
  try {
    const token = req.body?.token;
    if (!token) {
      console.warn('[FaucetPay IPN] Received callback without token parameter');
      res.status(400).send('Missing token');
      return;
    }

    console.log(`[FaucetPay IPN] Received payment token: ${token}. Verifying with FaucetPay...`);

    // Verify token with FaucetPay Merchant API
    const verifyUrl = `https://faucetpay.io/merchant/get-payment/${encodeURIComponent(token)}`;
    const verifyRes = await fetch(verifyUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'ytCash-Merchant/1.0' },
    });

    if (!verifyRes.ok) {
      console.warn(`[FaucetPay IPN] FaucetPay returned HTTP ${verifyRes.status}`);
      res.status(502).send('Error communicating with FaucetPay');
      return;
    }

    const data: any = await verifyRes.json();
    console.log('[FaucetPay IPN] Verification response:', data);

    if (!data || !data.valid) {
      console.warn('[FaucetPay IPN] Payment verification failed or invalid:', data);
      res.status(400).send('Invalid payment token');
      return;
    }

    // Match transaction by custom ID (our Transaction._id)
    const customTxId = data.custom;
    let transaction = null;

    if (customTxId) {
      transaction = await Transaction.findById(customTxId);
    }

    // Fallback: search by referenceId if custom was not ObjectId
    if (!transaction && customTxId) {
      transaction = await Transaction.findOne({ referenceId: customTxId, status: 'pending' });
    }

    if (!transaction) {
      console.warn(`[FaucetPay IPN] No pending transaction found matching custom: ${customTxId}`);
      res.status(404).send('Transaction not found');
      return;
    }

    if (transaction.status === 'completed') {
      console.log(`[FaucetPay IPN] Transaction ${transaction._id} already marked completed. Idempotent skip.`);
      res.status(200).send('*ok*');
      return;
    }

    // Credit user's balance
    const user = await User.findById(transaction.userId);
    if (!user) {
      console.warn(`[FaucetPay IPN] User ${transaction.userId} not found`);
      res.status(404).send('User not found');
      return;
    }

    const creditedAmount = Number(data.amount1) || transaction.amount;
    const cryptoCoin = data.currency2 || 'Crypto';

    user.creatorBalance = (user.creatorBalance || 0) + creditedAmount;
    user.balance = (user.balance || 0) + creditedAmount;
    await user.save();

    transaction.status = 'completed';
    transaction.amount = creditedAmount;
    transaction.balanceAfter = user.creatorBalance;
    transaction.senderAccount = data.merchant_username || 'FaucetPay Merchant';
    transaction.referenceId = String(data.transaction_id || token);
    transaction.notes = `Automated Crypto Deposit Confirmed via FaucetPay (${cryptoCoin})`;
    transaction.processedAt = new Date();
    await transaction.save();

    console.log(`[FaucetPay IPN] Successfully credited $${creditedAmount} USD to user ${user.email} (New Balance: $${user.creatorBalance})`);
    res.status(200).send('*ok*');
  } catch (error: any) {
    console.error('[FaucetPay IPN] Exception:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST /api/wallet/faucetpay-verify-order - Check status of crypto order on frontend return
router.post('/faucetpay-verify-order', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, error: 'Order ID is required' });
      return;
    }

    const transaction = await Transaction.findOne({
      _id: orderId,
      userId: req.user!._id,
    });

    if (!transaction) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const freshUser = await User.findById(req.user!._id);

    res.json({
      success: true,
      data: {
        status: transaction.status,
        amount: transaction.amount,
        balance: freshUser ? freshUser.creatorBalance : req.user!.creatorBalance,
        isCompleted: transaction.status === 'completed',
        referenceId: transaction.referenceId,
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

    const { amount, method, sourceBalance, deviceInfo: customDeviceInfo } = parsed.data;
    const isCreatorWithdraw = sourceBalance === 'creator';

    // Fetch dynamic withdraw methods configuration from admin settings
    const withdrawMethods = await getSystemWithdrawMethods();
    const currentMethod = withdrawMethods.find((m) => m.id === method);

    if (currentMethod && currentMethod.enabled === false) {
      res.status(400).json({
        success: false,
        error: `Withdrawals via ${currentMethod.name || method.toUpperCase()} are currently disabled by administration.`,
      });
      return;
    }



    // Strict Security Rule: Payment method must already be bound and saved in user profile settings
    const linkedMethod = req.user!.savedPaymentMethods?.find((p) => p.method === method);
    if (!linkedMethod || !linkedMethod.accountNumber || !linkedMethod.accountNumber.trim()) {
      res.status(400).json({
        success: false,
        error: `Payment method ${method.toUpperCase()} is not linked to your profile. You must set and save your verified payment account in Profile Settings before requesting a withdrawal.`,
      });
      return;
    }

    const normalizedAccount = linkedMethod.accountNumber.trim().replace(/[\s-]/g, '');

    // Anti-Multi-Account Security Rule: Check if this payment number/address is already bound to another user
    const duplicateUser = await User.findOne({
      _id: { $ne: req.user!._id },
      'savedPaymentMethods.method': method,
      'savedPaymentMethods.accountNumber': normalizedAccount,
    });

    if (duplicateUser) {
      res.status(400).json({
        success: false,
        error: `Security Alert: This ${method.toUpperCase()} account (${normalizedAccount}) is already bound to another user account. You cannot withdraw to an account linked elsewhere.`,
      });
      return;
    }

    // Atomic balance check & deduction (Creator Budget or Viewer Earnings)
    const updatedUser = isCreatorWithdraw
      ? await User.findOneAndUpdate(
          {
            _id: req.user!._id,
            $or: [
              { creatorBalance: { $gte: amount } },
              { creatorBalance: { $exists: false }, balance: { $gte: amount } },
            ],
          },
          { $inc: { creatorBalance: -amount, totalWithdrawn: amount, balance: -amount } },
          { new: true }
        )
      : await User.findOneAndUpdate(
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
      const avail = isCreatorWithdraw
        ? (req.user!.creatorBalance !== undefined ? req.user!.creatorBalance : req.user!.balance)
        : (req.user!.viewerBalance !== undefined ? req.user!.viewerBalance : req.user!.balance);
      res.status(400).json({
        success: false,
        error: `Insufficient ${isCreatorWithdraw ? 'creator budget' : 'viewer balance'} ($${avail.toFixed(4)} available) for withdrawal of $${amount.toFixed(2)}`,
      });
      return;
    }

    // Extract complete client IP and Device telemetry
    const telemetry = await extractFullClientTelemetry(req, {
      country: req.body.country,
      browser: req.body.browser,
      platform: req.body.platform,
      deviceName: req.body.deviceName || customDeviceInfo,
      timezone: req.body.timezone,
      userAgent: req.headers['user-agent'] as string,
    });

    const withdrawRole = isCreatorWithdraw ? 'creator' : 'viewer';

    const payout = await Payout.create({
      viewerId: req.user!._id,
      sourceBalance: withdrawRole,
      amount,
      method,
      accountDetails: normalizedAccount,
      status: 'pending',
      ipAddress: telemetry.ipAddress,
      country: telemetry.country,
      countryCode: telemetry.countryCode,
      browser: telemetry.browser,
      platform: telemetry.platform,
      deviceName: telemetry.deviceName,
      userAgent: telemetry.userAgent,
      deviceInfo: telemetry.deviceName,
      clientPlatform: telemetry.platform,
    });

    await Transaction.create({
      userId: req.user!._id,
      role: withdrawRole,
      type: 'payout',
      amount: -amount,
      balanceAfter: isCreatorWithdraw
        ? updatedUser.creatorBalance
        : (updatedUser.viewerBalance !== undefined ? updatedUser.viewerBalance : updatedUser.balance),
      status: 'pending',
      gateway: method as any,
      referenceId: payout._id.toString(),
      notes: `${isCreatorWithdraw ? 'Creator Budget' : 'Viewer'} withdrawal request to ${method.toUpperCase()}: ${normalizedAccount} (IP: ${telemetry.ipAddress})`,
    });

    res.status(201).json({
      success: true,
      data: {
        payout,
        newBalance: isCreatorWithdraw ? updatedUser.creatorBalance : updatedUser.balance,
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
    user.viewerBalance = (user.viewerBalance || 0) + usdAmount;
    user.totalEarned = (user.totalEarned || 0) + usdAmount;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      role: 'viewer',
      type: 'credit_conversion',
      amount: usdAmount,
      balanceAfter: user.viewerBalance !== undefined ? user.viewerBalance : user.balance,
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
        viewerBalance: user.viewerBalance,
        creatorBalance: user.creatorBalance,
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
    const { role, type, page, limit } = req.query;
    const query: any = { userId: req.user!._id };

    if (role === 'creator' || role === 'campaigner') {
      // Strictly Creator / Campaigner ad budget ledger: deposit, campaign_spend, and creator budget payouts/refunds
      if (type) {
        const types = (type as string).split(',').map((t) => t.trim());
        query.type = types.length === 1 ? types[0] : { $in: types };
      } else {
        query.type = { $in: ['deposit', 'campaign_spend', 'payout', 'refund'] };
      }
      query.role = { $ne: 'viewer' };
      query.$or = [
        { role: 'creator' },
        { role: 'campaigner' },
        {
          role: { $exists: false },
          type: { $in: ['deposit', 'campaign_spend'] },
        },
        {
          role: { $exists: false },
          type: { $in: ['payout', 'refund'] },
          notes: { $regex: /Creator/i },
        },
      ];
    } else if (role === 'viewer_payout') {
      // Viewer ledger shows viewer withdrawal history and viewer refund records only
      query.type = { $in: ['payout', 'refund'] };
      query.role = { $ne: 'creator' };
      query.$or = [
        { role: 'viewer' },
        {
          role: { $exists: false },
          notes: { $not: { $regex: /Creator/i } },
        },
      ];
    } else if (role === 'viewer_earning') {
      // Earning transactions
      query.type = { $in: ['earning', 'watch_credit', 'credit_conversion', 'referral_commission'] };
      query.role = { $ne: 'creator' };
    } else if (role === 'viewer') {
      // All viewer transactions
      if (type) {
        const types = (type as string).split(',').map((t) => t.trim());
        query.type = types.length === 1 ? types[0] : { $in: types };
      } else {
        query.type = { $in: ['earning', 'watch_credit', 'credit_conversion', 'referral_commission', 'payout', 'refund'] };
      }
      query.role = { $ne: 'creator' };
      query.$or = [
        { role: 'viewer' },
        {
          role: { $exists: false },
          type: { $in: ['earning', 'watch_credit', 'credit_conversion', 'referral_commission'] },
        },
        {
          role: { $exists: false },
          type: { $in: ['payout', 'refund'] },
          notes: { $not: { $regex: /Creator/i } },
        },
      ];
    } else if (type) {
      const types = (type as string).split(',').map((t) => t.trim());
      query.type = types.length === 1 ? types[0] : { $in: types };
    }

    const pageSize = limit ? Math.min(Math.max(parseInt(limit as string, 10) || 10, 1), 500) : 500;
    const pageNum = page ? Math.max(parseInt(page as string, 10) || 1, 1) : 1;
    const skip = (pageNum - 1) * pageSize;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
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

// GET /api/wallet/platform-stats - Platform-wide statistics (100% real database data)
router.get('/platform-stats', async (_req, res: Response): Promise<void> => {
  try {
    // 1. Real Total Platform Withdrawals & Deposits
    const payoutAgg = await Payout.aggregate([
      { $match: { status: { $ne: 'rejected' } } },
      { $group: { _id: null, totalWithdrawn: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const txPayoutAgg = await Transaction.aggregate([
      { $match: { type: 'payout', status: { $ne: 'rejected' } } },
      { $group: { _id: null, totalWithdrawn: { $sum: { $abs: '$amount' } }, count: { $sum: 1 } } },
    ]);
    const totalWithdrawnUsd = Number(Math.max(payoutAgg[0]?.totalWithdrawn || 0, txPayoutAgg[0]?.totalWithdrawn || 0).toFixed(2));
    const totalPayoutsCount = Math.max(payoutAgg[0]?.count || 0, txPayoutAgg[0]?.count || 0);

    const depositAgg = await Transaction.aggregate([
      { $match: { type: 'deposit', status: { $ne: 'rejected' } } },
      { $group: { _id: null, totalDeposits: { $sum: { $abs: '$amount' } }, count: { $sum: 1 } } },
    ]);
    const totalDepositsUsd = Number((depositAgg[0]?.totalDeposits || 0).toFixed(2));
    const totalDepositsCount = depositAgg[0]?.count || 0;

    // 2. Real Total Times Watched (Completed tasks + delivered campaign views)
    const tasksCompleted = await Task.countDocuments({ status: 'completed' });
    const deliveredViewsAgg = await Campaign.aggregate([
      { $group: { _id: null, total: { $sum: '$viewsDelivered' } } },
    ]);
    const campaignDelivered = deliveredViewsAgg[0]?.total || 0;
    const totalTimesWatched = tasksCompleted + campaignDelivered;

    // 3. Real Total Members
    const totalMembers = await User.countDocuments();
    const activeEarnersCount = totalMembers;

    // 4. Helper to compute real daily metrics for N days (Disbursed Payouts ONLY)
    const computeDaysMetrics = async (numDays: number) => {
      const now = new Date();
      const labels: string[] = [];
      const payoutValues: number[] = [];
      const depositValues: number[] = [];
      const totalValues: number[] = [];

      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        // Format DD.MM (e.g. 18.09)
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        labels.push(`${dd}.${mm}`);

        const dayWithdrawals = await Payout.aggregate([
          {
            $match: {
              status: 'approved',
              createdAt: { $gte: dayStart, $lte: dayEnd },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const dayWithdrawalsTx = await Transaction.aggregate([
          {
            $match: {
              type: 'payout',
              status: { $in: ['completed', 'approved', 'paid'] },
              createdAt: { $gte: dayStart, $lte: dayEnd },
            },
          },
          { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
        ]);
        const dayP = Number(Math.max(dayWithdrawals[0]?.total || 0, dayWithdrawalsTx[0]?.total || 0).toFixed(2));
        payoutValues.push(dayP);
        depositValues.push(0);
        totalValues.push(dayP);
      }

      return { labels, payoutValues, depositValues, totalValues, values: payoutValues };
    };

    // Helper to compute real monthly metrics for 12 months (Jan..Dec rolling) (Disbursed Payouts ONLY)
    const computeMonthlyMetrics = async () => {
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const labels: string[] = [];
      const payoutValues: number[] = [];
      const depositValues: number[] = [];
      const totalValues: number[] = [];

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        labels.push(monthNames[mStart.getMonth()]);

        const mWithdrawals = await Payout.aggregate([
          {
            $match: {
              status: 'approved',
              createdAt: { $gte: mStart, $lte: mEnd },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const mWithdrawalsTx = await Transaction.aggregate([
          {
            $match: {
              type: 'payout',
              status: { $in: ['completed', 'approved', 'paid'] },
              createdAt: { $gte: mStart, $lte: mEnd },
            },
          },
          { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
        ]);
        const mP = Number(Math.max(mWithdrawals[0]?.total || 0, mWithdrawalsTx[0]?.total || 0).toFixed(2));
        payoutValues.push(mP);
        depositValues.push(0);
        totalValues.push(mP);
      }

      return { labels, payoutValues, depositValues, totalValues, values: payoutValues };
    };

    const weekData = await computeDaysMetrics(7);
    const monthData = await computeMonthlyMetrics();

    // 5. Gateway Breakdown for Supported Site Gateways Only:
    // bkash, nagad, rocket, crypto (USDT BEP-20), faucetpay, payeer, webmoney
    const supportedGateways: { [key: string]: { name: string; color: string } } = {
      faucetpay: { name: 'FaucetPay USDT', color: '#38bdf8' },
      crypto: { name: 'USDT (BEP-20)', color: '#f87171' },
      bkash: { name: 'bKash', color: '#db2777' },
      nagad: { name: 'Nagad', color: '#ea580c' },
      rocket: { name: 'Rocket', color: '#8b5cf6' },
      payeer: { name: 'Payeer', color: '#0284c7' },
      webmoney: { name: 'WebMoney', color: '#0369a1' },
    };

    // Query real volume by gateway across all PAID PAYOUTS ONLY (Strictly No Deposits)
    const gatewayVolumeAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'payout',
          status: { $in: ['completed', 'approved', 'paid'] },
        },
      },
      {
        $group: {
          _id: '$gateway',
          totalAmount: { $sum: { $abs: '$amount' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const payoutModelAgg = await Payout.aggregate([
      {
        $match: {
          status: 'approved',
        },
      },
      {
        $group: {
          _id: '$method',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const gatewayMap: { [key: string]: number } = {};
    gatewayVolumeAgg.forEach((g) => {
      const gKey = (g._id || 'faucetpay').toLowerCase();
      const amt = Number((g.totalAmount || 0).toFixed(2));
      gatewayMap[gKey] = (gatewayMap[gKey] || 0) + amt;
    });

    payoutModelAgg.forEach((p) => {
      const pKey = (p._id || 'faucetpay').toLowerCase();
      const pAmt = Number((p.totalAmount || 0).toFixed(2));
      if ((gatewayMap[pKey] || 0) < pAmt) {
        gatewayMap[pKey] = pAmt;
      }
    });

    let totalAllGateways = 0;
    Object.values(gatewayMap).forEach((amt) => {
      totalAllGateways += amt;
    });
    totalAllGateways = Number(totalAllGateways.toFixed(2));

    const gatewayBreakdown = Object.keys(supportedGateways).map((key) => {
      const info = supportedGateways[key];
      const amt = gatewayMap[key] || 0;
      const percentage = totalAllGateways > 0 ? Number(((amt / totalAllGateways) * 100).toFixed(1)) : 0;
      return {
        id: key,
        name: info.name,
        color: info.color,
        amount: amt,
        percentage,
      };
    });

    // 6. Real-Time Payment History (Payouts ONLY with status "Paid")
    const recentPayoutsTx = await Transaction.find({
      type: 'payout',
      status: { $in: ['completed', 'approved'] },
    })
      .populate('userId', 'name email _id')
      .sort({ createdAt: -1 })
      .limit(60);

    const paymentHistory: any[] = recentPayoutsTx.map((tx: any, idx: number) => {
      const user = tx.userId;
      const email = user?.email || 'user@example.com';
      const name = user?.name || email.split('@')[0] || `User_${idx + 1}`;
      const shortId = user?._id ? String(user._id).slice(-6) : `${500000 + idx * 23}`;

      // Masked account
      const rawAcc = tx.senderAccount || tx.receiverAccount || tx.referenceId || email;
      const maskedAcc = rawAcc.length > 8
        ? `*****${rawAcc.slice(-6)}`
        : `*****${rawAcc}`;

      const d = new Date(tx.createdAt);
      const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

      return {
        id: tx._id,
        type: 'payout',
        userId: shortId,
        userName: name,
        wallet: maskedAcc,
        gateway: (tx.gateway || 'faucetpay').toLowerCase(),
        amount: Number(Math.abs(tx.amount).toFixed(2)),
        date: formattedDate,
        status: 'Paid',
        rawStatus: tx.status,
      };
    });

    // Also include any approved Payouts from Payout model that may not have matched by referenceId
    const txRefIds = new Set(recentPayoutsTx.map((t: any) => t.referenceId).filter(Boolean));
    const approvedPayouts = await Payout.find({ status: 'approved' })
      .populate('viewerId', 'name email _id')
      .sort({ processedAt: -1, createdAt: -1 })
      .limit(30);

    for (const p of approvedPayouts) {
      if (!txRefIds.has(p._id.toString())) {
        const u = p.viewerId as any;
        const email = u?.email || 'user@example.com';
        const name = u?.name || email.split('@')[0] || 'Earner';
        const shortId = u?._id ? String(u._id).slice(-6) : 'Payout';
        const rawAcc = p.accountDetails || email;
        const maskedAcc = rawAcc.length > 8 ? `*****${rawAcc.slice(-6)}` : `*****${rawAcc}`;
        const d = new Date(p.processedAt || p.createdAt);
        const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

        paymentHistory.push({
          id: p._id.toString(),
          type: 'payout',
          userId: shortId,
          userName: name,
          wallet: maskedAcc,
          gateway: (p.method || 'faucetpay').toLowerCase(),
          amount: Number(p.amount.toFixed(2)),
          date: formattedDate,
          status: 'Paid',
          rawStatus: p.status,
        });
      }
    }

    const now = new Date();
    const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const todayDayStr = daysArr[now.getDay()];

    res.json({
      success: true,
      data: {
        totalWithdrawnUsd,
        totalPayoutsCount,
        totalDepositsUsd,
        totalDepositsCount,
        totalTimesWatched,
        activeEarnersCount,
        todayDateStr,
        todayDayStr,
        timeframeData: {
          week: { labels: weekData.labels, values: weekData.totalValues, payoutValues: weekData.payoutValues, depositValues: weekData.depositValues },
          month: { labels: monthData.labels, values: monthData.totalValues, payoutValues: monthData.payoutValues, depositValues: monthData.depositValues },
        },
        gatewayBreakdown,
        paymentHistory,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export async function migrateTransactionRoles(): Promise<void> {
  try {
    // 1. Backfill creator role for deposits and campaign spends
    await Transaction.updateMany(
      { type: { $in: ['deposit', 'campaign_spend'] }, role: { $exists: false } },
      { $set: { role: 'creator' } }
    );

    // 2. Backfill viewer role for earnings, watch credits, credit conversions, referral commissions
    await Transaction.updateMany(
      { type: { $in: ['earning', 'watch_credit', 'credit_conversion', 'referral_commission'] }, role: { $exists: false } },
      { $set: { role: 'viewer' } }
    );

    // 3. Backfill creator role for payouts with notes containing "Creator"
    await Transaction.updateMany(
      { type: 'payout', notes: { $regex: /Creator/i }, role: { $exists: false } },
      { $set: { role: 'creator' } }
    );

    // 4. Backfill viewer role for remaining payouts
    await Transaction.updateMany(
      { type: 'payout', role: { $exists: false } },
      { $set: { role: 'viewer' } }
    );

    // 5. Backfill creator role for refunds with notes containing "Creator"
    await Transaction.updateMany(
      { type: 'refund', notes: { $regex: /Creator/i }, role: { $exists: false } },
      { $set: { role: 'creator' } }
    );

    // 6. Backfill viewer role for remaining refunds
    await Transaction.updateMany(
      { type: 'refund', role: { $exists: false } },
      { $set: { role: 'viewer' } }
    );

    // 7. Backfill Payout collection sourceBalance
    await Payout.updateMany(
      { sourceBalance: { $exists: false } },
      { $set: { sourceBalance: 'viewer' } }
    );

    console.log('[Migration] Transaction and Payout roles verified/backfilled successfully.');
  } catch (err: any) {
    console.error('[Migration] Note on transaction migration:', err.message);
  }
}

export const walletRouter = router;
