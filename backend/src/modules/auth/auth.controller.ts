import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { Transaction } from '../../models/Transaction.js';
import { config } from '../../config/index.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware.js';
import { sendPasswordResetEmail } from '../../services/email.service.js';

const router = Router();

async function getDailyStats(userId: any) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [spendAgg, earnAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId, type: 'campaign_spend', createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId,
            type: { $in: ['earning', 'credit_conversion', 'watch_credit'] },
            createdAt: { $gte: startOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const dailySpend = Number(Math.abs(spendAgg[0]?.total || 0).toFixed(2));
    const dailyEarnings = Number((earnAgg[0]?.total || 0).toFixed(4));
    return { dailySpend, dailyEarnings };
  } catch {
    return { dailySpend: 0, dailyEarnings: 0 };
  }
}

export function formatUserResponse(u: any, dailySpend: number = 0, dailyEarnings: number = 0) {
  const viewerBal = u.viewerBalance !== undefined ? u.viewerBalance : Math.max(0, (u.totalEarned || 0) - (u.totalWithdrawn || 0));
  const creatorBal = u.creatorBalance !== undefined ? u.creatorBalance : (u.balance || 0);

  return {
    id: u._id,
    email: u.email,
    name: u.name,
    phoneNumber: u.phoneNumber || '',
    role: u.role,
    adminRole: u.adminRole || (u.role === 'admin' ? 'master' : undefined),
    adminPermissions: u.adminPermissions || (u.role === 'admin' && (!u.adminRole || u.adminRole === 'master') ? ['deposits', 'withdrawals', 'campaigns'] : []),
    balance: u.balance ?? 0,
    viewerBalance: viewerBal,
    creatorBalance: creatorBal,
    credits: u.credits || 0,
    totalCreditsEarned: u.totalCreditsEarned || 0,
    totalEarned: u.totalEarned || 0,
    totalSpent: u.totalSpent || 0,
    totalWithdrawn: u.totalWithdrawn || 0,
    referralCode: u.referralCode,
    referralEarnings: u.referralEarnings || 0,
    referralCount: u.referralCount || 0,
    dailySpend,
    dailyEarnings,
    status: u.status || 'active',
    savedPaymentMethods: u.savedPaymentMethods || [],
    activeMobileDeviceId: u.activeMobileDeviceId,
    activeMobileDeviceModel: u.activeMobileDeviceModel,
    lastMobileActiveAt: u.lastMobileActiveAt,
    avatar: (u.avatar && !u.avatar.includes('7.x/adventurer/png') ? u.avatar : `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(u.email || u.name || 'user')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`),
  };
}

interface MobileDeviceCheckResult {
  allowed: boolean;
  error?: string;
  code?: string;
  activeDeviceId?: string;
  activeDeviceModel?: string;
}

export async function verifyAndBindMobileDevice(
  user: any,
  req: Request
): Promise<MobileDeviceCheckResult> {
  const isMobileApp =
    req.headers['x-client-platform'] === 'phone-app' ||
    req.headers['x-app-platform'] === 'phone-app' ||
    req.headers['x-device-type'] === 'phone' ||
    req.body?.platform === 'phone-app' ||
    req.body?.isMobile === true;

  if (!isMobileApp) {
    return { allowed: true };
  }

  const incomingDeviceId =
    (req.headers['x-device-id'] as string)?.trim() ||
    (req.body?.deviceId ? String(req.body.deviceId).trim() : '');

  const incomingDeviceModel =
    (req.headers['x-device-model'] as string)?.trim() ||
    (req.body?.deviceModel ? String(req.body.deviceModel).trim() : 'Android Phone');

  if (!incomingDeviceId) {
    return { allowed: true };
  }

  const forceLogoutOther = req.body?.forceLogoutOtherDevice === true;

  // Check if user is already logged in on a different mobile phone
  if (
    user.activeMobileDeviceId &&
    user.activeMobileDeviceId !== incomingDeviceId
  ) {
    if (forceLogoutOther) {
      user.activeMobileDeviceId = incomingDeviceId;
      user.activeMobileDeviceModel = incomingDeviceModel;
      user.lastMobileActiveAt = new Date();
      await user.save();
      return { allowed: true };
    }

    const otherModel = user.activeMobileDeviceModel || 'another phone';
    return {
      allowed: false,
      error: `This account is already logged in on another mobile device (${otherModel}). You can only be logged in on one mobile device at a time.`,
      code: 'ALREADY_LOGGED_IN_ON_ANOTHER_DEVICE',
      activeDeviceId: user.activeMobileDeviceId,
      activeDeviceModel: otherModel,
    };
  }

  // Same device or first device: bind device and timestamp
  user.activeMobileDeviceId = incomingDeviceId;
  user.activeMobileDeviceModel = incomingDeviceModel;
  user.lastMobileActiveAt = new Date();
  await user.save();

  return { allowed: true };
}

const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MY';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['campaigner', 'viewer']).optional().default('viewer'),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateTokens = (userId: string, role: string) => {
  const token = jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId }, config.jwtRefreshSecret, { expiresIn: '30d' });
  return { token, refreshToken };
};

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const { email, name, password, role } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ success: false, error: 'Email is already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let referredBy = undefined;
    if (parsed.data.referralCode) {
      const trimmedCode = parsed.data.referralCode.trim().toUpperCase();
      const referrer = await User.findOne({ referralCode: trimmedCode });
      if (referrer) {
        referredBy = referrer._id;
        await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } });
      }
    }

    let code = generateReferralCode();
    while (await User.exists({ referralCode: code })) {
      code = generateReferralCode();
    }

    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(email)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    const user = await User.create({
      email,
      name,
      passwordHash,
      role: role || 'viewer',
      avatar: randomAvatar,
      balance: 1.0, // Free starter credit for testing both viewing and campaigns!
      creatorBalance: 1.0,
      viewerBalance: 0,
      referralCode: code,
      referredBy,
      referralEarnings: 0,
      referralCount: 0,
    });

    const tokens = generateTokens(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      data: {
        user: formatUserResponse(user, 0, 0),
        ...tokens,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'banned') {
      res.status(403).json({ success: false, error: 'Account suspended' });
      return;
    }

    // Enforce single mobile device login policy
    const mobileCheck = await verifyAndBindMobileDevice(user, req);
    if (!mobileCheck.allowed) {
      res.status(403).json({
        success: false,
        error: mobileCheck.error,
        code: mobileCheck.code,
        activeDeviceModel: mobileCheck.activeDeviceModel,
      });
      return;
    }

    const tokens = generateTokens(user._id.toString(), user.role);
    const { dailySpend, dailyEarnings } = await getDailyStats(user._id);

    res.json({
      success: true,
      data: {
        user: formatUserResponse(user, dailySpend, dailyEarnings),
        ...tokens,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google One-Tap / OAuth Sign-in
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, name, avatar, googleId, role, credential, accessToken } = req.body;

    // 1. If Google ID token (credential) is passed (e.g. from Google Identity Services on Web)
    if (credential && typeof credential === 'string') {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const googleData: any = await verifyRes.json();
          if (googleData && googleData.email) {
            email = googleData.email;
            name = name || googleData.name || googleData.given_name;
            avatar = avatar || googleData.picture;
            googleId = googleId || googleData.sub;
          }
        } else {
          // Fallback to JWT payload decode
          const decoded: any = jwt.decode(credential);
          if (decoded && decoded.email) {
            email = decoded.email;
            name = name || decoded.name || decoded.given_name;
            avatar = avatar || decoded.picture;
            googleId = googleId || decoded.sub;
          }
        }
      } catch {
        const decoded: any = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = name || decoded.name || decoded.given_name;
          avatar = avatar || decoded.picture;
          googleId = googleId || decoded.sub;
        }
      }
    }

    // 2. If Google OAuth Access Token is passed
    if (accessToken && typeof accessToken === 'string' && !email) {
      try {
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userinfoRes.ok) {
          const info: any = await userinfoRes.json();
          if (info && info.email) {
            email = info.email;
            name = name || info.name || info.given_name;
            avatar = avatar || info.picture;
            googleId = googleId || info.sub;
          }
        }
      } catch (err) {
        console.warn('[GoogleAuth] Failed to fetch userinfo with access token:', err);
      }
    }

    if (!email) {
      res.status(400).json({ success: false, error: 'Valid Google email is required' });
      return;
    }

    email = email.toLowerCase().trim();
    name = name ? name.trim() : email.split('@')[0];
    const generatedAvatar = avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(email)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    let user = await User.findOne({ email });

    if (!user) {
      let referredBy = undefined;
      if (req.body.referralCode) {
        const trimmedCode = (req.body.referralCode as string).trim().toUpperCase();
        const referrer = await User.findOne({ referralCode: trimmedCode });
        if (referrer) {
          referredBy = referrer._id;
          await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } });
        }
      }

      let code = generateReferralCode();
      while (await User.exists({ referralCode: code })) {
        code = generateReferralCode();
      }

      user = await User.create({
        email,
        name,
        googleId,
        avatar: generatedAvatar,
        role: role === 'campaigner' ? 'campaigner' : 'viewer',
        balance: 1.0,
        creatorBalance: 1.0,
        viewerBalance: 0,
        referralCode: code,
        referredBy,
        referralEarnings: 0,
        referralCount: 0,
      });
    } else {
      let updated = false;
      if (name && (!user.name || user.name === user.email.split('@')[0])) {
        user.name = name;
        updated = true;
      }
      if (avatar && (!user.avatar || user.avatar.includes('dicebear'))) {
        user.avatar = avatar;
        updated = true;
      }
      if (googleId && !user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.referralCode) {
        let code = generateReferralCode();
        while (await User.exists({ referralCode: code })) {
          code = generateReferralCode();
        }
        user.referralCode = code;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    if (user.status === 'banned') {
      res.status(403).json({ success: false, error: 'This account is suspended' });
      return;
    }

    // Enforce single mobile device login policy
    const mobileCheck = await verifyAndBindMobileDevice(user, req);
    if (!mobileCheck.allowed) {
      res.status(403).json({
        success: false,
        error: mobileCheck.error,
        code: mobileCheck.code,
        activeDeviceModel: mobileCheck.activeDeviceModel,
      });
      return;
    }

    const tokens = generateTokens(user._id.toString(), user.role);
    const { dailySpend, dailyEarnings } = await getDailyStats(user._id);

    res.json({
      success: true,
      data: {
        user: formatUserResponse(user, dailySpend, dailyEarnings),
        ...tokens,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const u = req.user!;
  if (!u.referralCode) {
    let code = generateReferralCode();
    while (await User.exists({ referralCode: code })) {
      code = generateReferralCode();
    }
    u.referralCode = code;
    await u.save();
  }

  const { dailySpend, dailyEarnings } = await getDailyStats(u._id);

  res.json({
    success: true,
    data: formatUserResponse(u, dailySpend, dailyEarnings),
  });
});

// Referral Stats & History
router.get('/referrals', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    if (!user.referralCode) {
      let code = generateReferralCode();
      while (await User.exists({ referralCode: code })) {
        code = generateReferralCode();
      }
      user.referralCode = code;
      await user.save();
    }

    const recentCommissions = await Transaction.find({
      userId: user._id,
      type: 'referral_commission',
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralEarnings: user.referralEarnings || 0,
        referralCount: user.referralCount || 0,
        commissionRate: 10,
        recentCommissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Switch Profile (Creator <-> Viewer)
router.post('/switch-profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetRole } = req.body;
    if (!targetRole || !['campaigner', 'creator', 'viewer'].includes(targetRole)) {
      res.status(400).json({ success: false, error: 'Valid target profile role (creator or viewer) is required' });
      return;
    }

    const normalizedRole = (targetRole === 'creator' || targetRole === 'campaigner') ? 'campaigner' : 'viewer';
    const user = req.user!;

    if (user.role !== 'admin') {
      user.role = normalizedRole;
      await user.save();
    }

    const tokens = generateTokens(user._id.toString(), user.role);
    const { dailySpend, dailyEarnings } = await getDailyStats(user._id);

    res.json({
      success: true,
      data: {
        user: formatUserResponse(user, dailySpend, dailyEarnings),
        ...tokens,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin & Sub-Admin Login (Route: /admin)
router.post('/admin-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, email } = req.body;
    const adminSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || 'myyt@2026';

    // 1. If email is provided -> Sub-Admin Staff authentication
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const cleanEmail = email.trim().toLowerCase();
      if (!password) {
        res.status(400).json({ success: false, error: 'Password is required' });
        return;
      }

      const subAdmin = await User.findOne({ email: cleanEmail, role: 'admin', adminRole: 'sub_admin' });
      if (!subAdmin || !subAdmin.passwordHash) {
        res.status(401).json({ success: false, error: 'Invalid staff email or password' });
        return;
      }

      const valid = await bcrypt.compare(password, subAdmin.passwordHash);
      if (!valid) {
        res.status(401).json({ success: false, error: 'Invalid staff email or password' });
        return;
      }

      if (subAdmin.status === 'suspended' || subAdmin.status === 'banned') {
        res.status(403).json({ success: false, error: 'Access revoked: Your sub-admin account is currently suspended by the Master Admin.' });
        return;
      }

      const tokens = generateTokens(subAdmin._id.toString(), 'admin');
      res.json({
        success: true,
        data: {
          user: formatUserResponse(subAdmin, 0, 0),
          ...tokens,
        },
      });
      return;
    }

    // 2. Otherwise -> Master Administrator Security Password authentication
    if (!password || password !== adminSecret) {
      res.status(401).json({ success: false, error: 'Invalid master admin password. Access denied.' });
      return;
    }

    // Find or automatically create the preset system administrator account
    let adminUser = await User.findOne({ role: 'admin', adminRole: { $ne: 'sub_admin' } });
    if (!adminUser) {
      adminUser = await User.findOne({ email: 'admin@myyt.io' });
    }

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminSecret, salt);
      adminUser = await User.create({
        email: 'admin@myyt.io',
        name: 'System Administrator',
        passwordHash,
        role: 'admin',
        adminRole: 'master',
        adminPermissions: ['deposits', 'withdrawals', 'campaigns'],
        balance: 1000.0,
        creatorBalance: 1000.0,
        viewerBalance: 0,
        avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=myyt-admin&backgroundColor=b6e3f4',
      });
    } else if (adminUser.role !== 'admin' || adminUser.adminRole !== 'master') {
      adminUser.role = 'admin';
      adminUser.adminRole = 'master';
      if (!adminUser.adminPermissions || adminUser.adminPermissions.length === 0) {
        adminUser.adminPermissions = ['deposits', 'withdrawals', 'campaigns'];
      }
      await adminUser.save();
    }

    const tokens = generateTokens(adminUser._id.toString(), 'admin');

    res.json({
      success: true,
      data: {
        user: formatUserResponse(adminUser, 0, 0),
        ...tokens,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Profile Details (Name, Phone Number, Avatar)
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phoneNumber, avatar } = req.body;
    const user = req.user!;

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (phoneNumber !== undefined) {
      user.phoneNumber = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
    }
    if (avatar && typeof avatar === 'string') {
      user.avatar = avatar;
    }

    await user.save();
    const { dailySpend, dailyEarnings } = await getDailyStats(user._id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: formatUserResponse(user, dailySpend, dailyEarnings),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update profile' });
  }
});

const savePaymentMethodSchema = z.object({
  method: z.enum(['bkash', 'nagad', 'rocket', 'crypto', 'faucetpay', 'webmoney', 'payeer']),
  accountNumber: z.string().min(3, 'Account number / address is required'),
  accountName: z.string().optional(),
});

// GET /api/auth/payment-methods - Get current user's saved payment methods
router.get('/payment-methods', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    res.json({
      success: true,
      data: user?.savedPaymentMethods || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/payment-methods - Save/Update payment method (1 method per account only!)
router.post('/payment-methods', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = savePaymentMethodSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const { method, accountNumber, accountName } = parsed.data;
    const normalized = accountNumber.trim().replace(/[\s-]/g, '');

    // Anti-Multi-Account Rule: Verify if this payment account is already linked to another user
    const duplicate = await User.findOne({
      _id: { $ne: req.user!._id },
      savedPaymentMethods: {
        $elemMatch: {
          method,
          accountNumber: normalized,
        },
      },
    });

    if (duplicate) {
      res.status(400).json({
        success: false,
        error: `This ${method.toUpperCase()} number/address (${normalized}) is already bound with another user account. Each payment method can only be linked to one account.`,
      });
      return;
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (!user.savedPaymentMethods) {
      user.savedPaymentMethods = [];
    }

    const idx = user.savedPaymentMethods.findIndex((p) => p.method === method);
    if (idx >= 0) {
      user.savedPaymentMethods[idx].accountNumber = normalized;
      user.savedPaymentMethods[idx].accountName = accountName?.trim() || undefined;
      user.savedPaymentMethods[idx].updatedAt = new Date();
    } else {
      user.savedPaymentMethods.push({
        method,
        accountNumber: normalized,
        accountName: accountName?.trim() || undefined,
        updatedAt: new Date(),
      });
    }

    await user.save();

    res.json({
      success: true,
      message: `✓ ${method.toUpperCase()} account (${normalized}) successfully bound to your profile!`,
      data: {
        savedPaymentMethods: user.savedPaymentMethods,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/auth/payment-methods/:method - Remove saved payment method
router.delete('/payment-methods/:method', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { method } = req.params;
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    user.savedPaymentMethods = (user.savedPaymentMethods || []).filter((p) => p.method !== method);
    await user.save();

    res.json({
      success: true,
      message: `${String(method).toUpperCase()} account removed from profile`,
      data: {
        savedPaymentMethods: user.savedPaymentMethods,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change Password
router.put('/change-password', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user!;

    if (
      !newPassword ||
      typeof newPassword !== 'string' ||
      newPassword.length < 8 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long and contain both letters and numbers',
      });
      return;
    }

    // If user has an existing password, verify current password
    if (user.passwordHash) {
      if (!currentPassword) {
        res.status(400).json({ success: false, error: 'Current password is required' });
        return;
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        res.status(400).json({ success: false, error: 'Current password does not match' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to change password' });
  }
});

// Forgot Password - Generates 6-Digit OTP Reset Code
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'Valid email address is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(404).json({ success: false, error: 'No account found with this email address' });
      return;
    }

    // Generate 6-digit OTP code with 15-minute expiration
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send verification code via Resend
    const emailResult = await sendPasswordResetEmail(normalizedEmail, resetCode, user.name);

    res.json({
      success: true,
      message: emailResult.success
        ? 'A 6-digit verification code has been sent to your email address.'
        : 'Password reset code generated. If email delivery is delayed, use the provided code.',
      resetCode, // Returned for seamless testing & instant entry
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error processing request' });
  }
});

// Reset Password with OTP Code
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      res.status(400).json({ success: false, error: 'Email, reset code, and new password are required' });
      return;
    }

    if (
      typeof newPassword !== 'string' ||
      newPassword.length < 8 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long and contain both letters and numbers',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: resetCode.toString().trim(),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error resetting password' });
  }
});

// Logout - Disconnects mobile device session if requested
router.post('/logout', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const isMobile =
      req.headers['x-client-platform'] === 'phone-app' ||
      req.headers['x-device-type'] === 'phone' ||
      req.body?.platform === 'phone-app';

    const incomingDeviceId =
      (req.headers['x-device-id'] as string)?.trim() ||
      req.body?.deviceId?.trim();

    if (
      !user.activeMobileDeviceId ||
      !incomingDeviceId ||
      user.activeMobileDeviceId === incomingDeviceId
    ) {
      user.activeMobileDeviceId = undefined;
      user.activeMobileDeviceModel = undefined;
      await user.save();
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const authRouter = router;
