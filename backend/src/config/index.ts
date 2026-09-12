import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myyt',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || 'myyt-jwt-secret-key-2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'myyt-jwt-refresh-secret-2026',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'admin123',
  adminPassword: process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || 'myyt@2026',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Platform Pricing Tiers (Durations: 8, 16, 45, 60, 120, 180, 300s)
  pricingTiers: {
    8: { campaignerCost: 0.0040, viewerReward: 0.0028 },
    16: { campaignerCost: 0.0055, viewerReward: 0.0039 },
    45: { campaignerCost: 0.0088, viewerReward: 0.0062 },
    60: { campaignerCost: 0.0100, viewerReward: 0.0072 },
    120: { campaignerCost: 0.0150, viewerReward: 0.0110 },
    180: { campaignerCost: 0.0210, viewerReward: 0.0155 },
    300: { campaignerCost: 0.0320, viewerReward: 0.0240 },
  } as Record<number, { campaignerCost: number; viewerReward: number }>,

  // Cooldown in seconds before a viewer can watch the same video again (Controlled dynamically from Admin Panel)
  enableCooldown: false,
  videoCooldownSeconds: 0,
  
  // Timing tolerance for server watch verification (in seconds)
  timeToleranceSeconds: 2,
};
