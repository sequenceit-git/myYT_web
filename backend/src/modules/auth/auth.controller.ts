import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { config } from '../../config/index.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['campaigner', 'viewer']).optional().default('viewer'),
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

    const randomAvatar = `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(email)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    const user = await User.create({
      email,
      name,
      passwordHash,
      role: role || 'viewer',
      avatar: randomAvatar,
      balance: 1.0, // Free starter credit for testing both viewing and campaigns!
      creatorBalance: 1.0,
      viewerBalance: 0,
    });

    const tokens = generateTokens(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          balance: user.balance,
          avatar: user.avatar || randomAvatar,
        },
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

    const tokens = generateTokens(user._id.toString(), user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          balance: user.balance,
          credits: user.credits || 0,
          totalCreditsEarned: user.totalCreditsEarned || 0,
          totalEarned: user.totalEarned,
          avatar: (user.avatar ? user.avatar.replace('/svg', '/png') : `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(user.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`),
        },
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
    let { email, name, avatar, googleId, role, credential } = req.body;

    // If a Google GIS JWT credential is provided, decode payload
    if (credential && typeof credential === 'string') {
      try {
        const decoded: any = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = name || decoded.name || decoded.given_name;
          avatar = avatar || decoded.picture;
          googleId = googleId || decoded.sub;
        }
      } catch (e) {
        // Fallback to direct parameters
      }
    }

    if (!email) {
      res.status(400).json({ success: false, error: 'Valid Google email is required' });
      return;
    }

    email = email.toLowerCase().trim();
    name = name || email.split('@')[0];
    const generatedAvatar = avatar ? avatar.replace('/svg', '/png') : `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(email)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        avatar: generatedAvatar,
        role: role === 'campaigner' ? 'campaigner' : 'viewer',
        balance: 1.0,
        creatorBalance: 1.0,
        viewerBalance: 0,
      });
    } else {
      let updated = false;
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        updated = true;
      }
      if (googleId && !user.googleId) {
        user.googleId = googleId;
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

    const tokens = generateTokens(user._id.toString(), user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          balance: user.balance,
          credits: user.credits || 0,
          totalCreditsEarned: user.totalCreditsEarned || 0,
          avatar: user.avatar,
          totalEarned: user.totalEarned,
          totalSpent: user.totalSpent,
        },
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
  const viewerBal = u.viewerBalance !== undefined ? u.viewerBalance : Math.max(0, (u.totalEarned || 0) - (u.totalWithdrawn || 0));
  const creatorBal = u.creatorBalance !== undefined ? u.creatorBalance : (u.balance || 0);

  res.json({
    success: true,
    data: {
      id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      balance: u.balance,
      viewerBalance: viewerBal,
      creatorBalance: creatorBal,
      credits: u.credits || 0,
      totalCreditsEarned: u.totalCreditsEarned || 0,
      totalEarned: u.totalEarned,
      totalSpent: u.totalSpent,
      totalWithdrawn: u.totalWithdrawn,
      status: u.status,
      avatar: (u.avatar ? u.avatar.replace('/svg', '/png') : `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(u.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`),
    },
  });
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
    const viewerBal = user.viewerBalance !== undefined ? user.viewerBalance : Math.max(0, (user.totalEarned || 0) - (user.totalWithdrawn || 0));
    const creatorBal = user.creatorBalance !== undefined ? user.creatorBalance : (user.balance || 0);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          balance: user.balance,
          viewerBalance: viewerBal,
          creatorBalance: creatorBal,
          credits: user.credits || 0,
          totalCreditsEarned: user.totalCreditsEarned || 0,
          totalEarned: user.totalEarned,
          totalSpent: user.totalSpent,
          totalWithdrawn: user.totalWithdrawn,
          status: user.status,
          avatar: (user.avatar ? user.avatar.replace('/svg', '/png') : `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(user.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`),
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Password-Only Login (Route: /admin)
router.post('/admin-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const adminSecret = process.env.ADMIN_PASSWORD || 'myyt@2026';

    if (!password || password !== adminSecret) {
      res.status(401).json({ success: false, error: 'Invalid admin password. Access denied.' });
      return;
    }

    // Find or automatically create the preset system administrator account
    let adminUser = await User.findOne({ role: 'admin' });
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
        balance: 1000.0,
        creatorBalance: 1000.0,
        viewerBalance: 0,
        avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=myyt-admin&backgroundColor=b6e3f4',
      });
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
    }

    const tokens = generateTokens(adminUser._id.toString(), 'admin');

    res.json({
      success: true,
      data: {
        user: {
          id: adminUser._id,
          email: adminUser.email,
          name: adminUser.name,
          role: 'admin',
          balance: adminUser.balance,
          avatar: adminUser.avatar,
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const authRouter = router;
