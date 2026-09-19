import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { authRouter } from './modules/auth/auth.controller.js';
import { campaignsRouter } from './modules/campaigns/campaigns.controller.js';
import { tasksRouter } from './modules/tasks/tasks.controller.js';
import { walletRouter } from './modules/wallet/wallet.controller.js';
import { adminRouter, getSystemExchangeRate } from './modules/admin/admin.controller.js';

export const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request Client Hints (Sec-CH-UA-Model, Sec-CH-UA-Platform) for hardware device model detection
app.use((_req, res, next) => {
  res.setHeader('Accept-CH', 'Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version');
  res.setHeader('Permissions-Policy', 'ch-ua-model=*, ch-ua-platform=*, ch-ua-platform-version=*');
  next();
});

// Health check endpoints
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'ytCash API Backend',
    timestamp: new Date().toISOString(),
    pricingTiers: config.pricingTiers,
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Public platform exchange rate (USD to BDT)
app.get('/api/public/exchange-rate', async (_req, res) => {
  try {
    const usdToBdt = await getSystemExchangeRate();
    res.json({
      success: true,
      data: {
        usdToBdt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});
