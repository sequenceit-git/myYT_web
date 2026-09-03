import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config/index.js';

async function bootstrap() {
  try {
    console.log(`[Database] Connecting to MongoDB at ${config.mongoUri}...`);
    await mongoose.connect(config.mongoUri);
    console.log('[Database] MongoDB connected successfully');

    app.listen(config.port, () => {
      console.log(`[Server] myYT API Server running on port ${config.port} (env: ${config.nodeEnv})`);
      console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('[Server] Fatal bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
