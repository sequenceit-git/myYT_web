import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { Campaign } from '../models/Campaign.js';
import { Payout } from '../models/Payout.js';
import { Transaction } from '../models/Transaction.js';

async function seed() {
  console.log('[Seed] Connecting to database at:', config.mongoUri);
  await mongoose.connect(config.mongoUri);

  console.log('[Seed] Cleaning existing data...');
  await User.deleteMany({});
  await Campaign.deleteMany({});
  await Payout.deleteMany({});
  await Transaction.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('secret123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);

  console.log('[Seed] Creating demo users...');
  const admin = await User.create({
    name: 'Platform Super Admin',
    email: 'admin@myyt.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    balance: 9999.0,
    trustScore: 100,
  });

  const campaigner = await User.create({
    name: 'Demo Campaigner',
    email: 'campaigner@myyt.com',
    passwordHash,
    role: 'campaigner',
    balance: 75.5,
    totalSpent: 24.5,
  });

  const viewer = await User.create({
    name: 'Demo Viewer',
    email: 'viewer@myyt.com',
    passwordHash,
    role: 'viewer',
    balance: 14.85,
    totalEarned: 22.5,
    totalWithdrawn: 7.65,
  });

  console.log('[Seed] Creating active YouTube campaigns...');
  const campaigns = await Campaign.create([
    {
      ownerId: campaigner._id,
      title: 'Learn Web Development in 2026 - Crash Course',
      youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      videoId: 'jNQXAC9IVRw',
      targetViews: 500,
      watchDurationSec: 15,
      pricePerView: 0.004,
      totalCost: 2.0,
      viewsDelivered: 42,
      status: 'active',
      thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    },
    {
      ownerId: campaigner._id,
      title: 'Top AI Tools & Automation Guide',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoId: 'dQw4w9WgXcQ',
      targetViews: 1000,
      watchDurationSec: 30,
      pricePerView: 0.007,
      totalCost: 7.0,
      viewsDelivered: 128,
      status: 'active',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    },
    {
      ownerId: campaigner._id,
      title: 'Fast Scalable System Architecture Tutorial',
      youtubeUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
      videoId: 'L_LUpnjgPso',
      targetViews: 300,
      watchDurationSec: 60,
      pricePerView: 0.013,
      totalCost: 3.9,
      viewsDelivered: 15,
      status: 'active',
      thumbnailUrl: 'https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg',
    },
  ]);

  console.log('[Seed] Creating sample payouts for live proof feed...');
  await Payout.create([
    {
      viewerId: viewer._id,
      amount: 5.0,
      method: 'bkash',
      accountDetails: '01712345678',
      status: 'approved',
      transactionRef: 'BKS-994821',
      processedAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      viewerId: viewer._id,
      amount: 2.65,
      method: 'nagad',
      accountDetails: '01898765432',
      status: 'approved',
      transactionRef: 'NGD-551204',
      processedAt: new Date(Date.now() - 3600000 * 5),
    },
    {
      viewerId: viewer._id,
      amount: 10.0,
      method: 'crypto',
      accountDetails: 'TXYZ...TRC20',
      status: 'pending',
    },
  ]);

  console.log('[Seed] Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Default credentials:');
  console.log('Admin:       admin@myyt.com       / admin123');
  console.log('Campaigner:  campaigner@myyt.com  / secret123');
  console.log('Viewer:      viewer@myyt.com      / secret123');
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
