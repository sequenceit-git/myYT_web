import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myyt',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  jwtSecret: process.env.JWT_SECRET || 'myyt-jwt-secret-key-2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'myyt-jwt-refresh-secret-2026',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'admin123',
  adminPassword: process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || 'myyt@2026',
  
  // Platform Pricing Tiers (Base Price: 1000 views, 10s = $5.00)
  pricingTiers: {
    10: { campaignerCost: 0.0050, viewerReward: 0.0035 },
    15: { campaignerCost: 0.0058, viewerReward: 0.0040 },
    30: { campaignerCost: 0.0075, viewerReward: 0.0052 },
    45: { campaignerCost: 0.0088, viewerReward: 0.0062 },
    60: { campaignerCost: 0.0100, viewerReward: 0.0072 },
    120: { campaignerCost: 0.0150, viewerReward: 0.0110 },
  } as Record<number, { campaignerCost: number; viewerReward: number }>,

  // Cooldown in seconds before a viewer can watch the same video again (default: 1 hour, disabled if ENABLE_COOLDOWN=false)
  enableCooldown: process.env.ENABLE_COOLDOWN === 'true',
  videoCooldownSeconds: parseInt(process.env.VIDEO_COOLDOWN_SECONDS || '3600', 10),
  
  // Timing tolerance for server watch verification (in seconds)
  timeToleranceSeconds: 2,
};
