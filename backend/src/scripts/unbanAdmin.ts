import mongoose from 'mongoose';
import dns from 'node:dns';
import { config } from '../config/index.js';
import { User } from '../models/User.js';

// Prioritize IPv4 and resilient public DNS to mitigate Windows/macOS SRV query timeouts
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore
}

async function run() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  console.log(`[Unban] Connecting to database at: ${config.mongoUri}...`);
  await mongoose.connect(config.mongoUri);
  console.log('[Unban] Connected successfully.');

  let filter: any = {};
  if (targetEmail) {
    filter = { email: targetEmail };
    console.log(`[Unban] Searching for user with email: "${targetEmail}"...`);
  } else {
    // Unban all admins who are banned or suspended, or all admins in general
    filter = { role: 'admin' };
    console.log('[Unban] Searching for admin users...');
  }

  const users = await User.find(filter);

  if (users.length === 0) {
    console.log('[Unban] No matching users found.');
    await mongoose.disconnect();
    return;
  }

  for (const user of users) {
    const prevStatus = user.status;
    user.status = 'active';
    await user.save();
    console.log(`✅ Unbanned user: ${user.email} (${user.name}) | Role: ${user.role} | Previous Status: ${prevStatus} -> New Status: active`);
  }

  console.log('[Unban] Operation finished successfully.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[Unban] Error:', err);
  process.exit(1);
});
