import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ytcash';

// Prioritize IPv4 and resilient public DNS
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore
}

async function run() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  console.log(`[Unban] Connecting to MongoDB at: ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('[Unban] Connected successfully.');

  const collection = mongoose.connection.collection('users');

  let filter = {};
  if (targetEmail) {
    filter = { email: targetEmail };
    console.log(`[Unban] Target user: "${targetEmail}"`);
  } else {
    filter = { role: 'admin' };
    console.log('[Unban] Searching for all admin users...');
  }

  const admins = await collection.find(filter).toArray();

  if (!admins || admins.length === 0) {
    console.log('[Unban] ⚠️ No matching users found.');
    await mongoose.disconnect();
    return;
  }

  const result = await collection.updateMany(filter, { $set: { status: 'active' } });
  console.log(`\n🎉 Successfully restored! Matched: ${result.matchedCount}, Updated: ${result.modifiedCount}`);

  for (const admin of admins) {
    console.log(` -> Admin: ${admin.email} (${admin.name || 'Admin'}) | Status set to: 'active'`);
  }

  await mongoose.disconnect();
  console.log('\n[Unban] You can now log into your admin account normally.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[Unban] Error:', err);
  process.exit(1);
});
