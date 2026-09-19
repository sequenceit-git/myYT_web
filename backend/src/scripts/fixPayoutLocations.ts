import mongoose from 'mongoose';
import dotenv from 'dotenv';
import geoip from 'geoip-lite';
import { Payout } from '../models/Payout.js';

dotenv.config();

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const resolveFromIp = async (ipAddress: string): Promise<{ country: string; countryCode: string } | null> => {
  if (
    !ipAddress ||
    ipAddress === '127.0.0.1' ||
    ipAddress === '::1' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.')
  ) {
    return { country: 'Localhost', countryCode: 'LO' };
  }

  // 1. Live ip-api.com query (exact match for 162.128.225.6 -> Hong Kong, HK)
  try {
    const res = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,city`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.country) {
        return {
          country: data.country,
          countryCode: data.countryCode || '',
        };
      }
    }
  } catch {}

  // 2. Offline fallback via geoip-lite
  try {
    const geo = geoip.lookup(ipAddress);
    if (geo && geo.country) {
      let countryName = geo.country;
      try {
        const name = regionNames.of(geo.country);
        if (name) countryName = name;
      } catch {}
      return { country: countryName, countryCode: geo.country };
    }
  } catch {}

  return null;
};

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  const payouts = await Payout.find({});
  console.log(`Found ${payouts.length} total payout records.`);

  let updatedCount = 0;
  for (const p of payouts) {
    if (p.ipAddress) {
      const geo = await resolveFromIp(p.ipAddress);
      if (geo && (geo.country !== p.country || geo.countryCode !== p.countryCode)) {
        console.log(
          `Updating payout ${p._id}: IP ${p.ipAddress} | "${p.country}" (${p.countryCode}) -> "${geo.country}" (${geo.countryCode})`
        );
        p.country = geo.country;
        p.countryCode = geo.countryCode;
        await p.save();
        updatedCount++;
      }
    }
  }

  console.log(`Finished. Updated ${updatedCount} payout records.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error fixing payout locations:', err);
  process.exit(1);
});
