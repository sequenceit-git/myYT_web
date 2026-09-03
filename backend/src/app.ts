import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { authRouter } from './modules/auth/auth.controller.js';
import { campaignsRouter } from './modules/campaigns/campaigns.controller.js';
import { tasksRouter } from './modules/tasks/tasks.controller.js';
import { walletRouter } from './modules/wallet/wallet.controller.js';
import { adminRouter } from './modules/admin/admin.controller.js';

export const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'myYT API Backend',
    timestamp: new Date().toISOString(),
    pricingTiers: config.pricingTiers,
  });
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
