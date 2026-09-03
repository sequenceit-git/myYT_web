import mongoose from 'mongoose';
import dns from 'node:dns';
import { app } from './app.js';
import { config } from './config/index.js';

// Prioritize IPv4 and resilient public DNS to mitigate Windows SRV query timeouts
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore in environments where custom DNS cannot be configured
}

async function connectDatabase() {
  const primaryUri = config.mongoUri;
  const localFallbackUri = 'mongodb://127.0.0.1:27017/myyt';

  try {
    console.log(`[Database] Connecting to MongoDB at ${primaryUri}...`);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log('[Database] MongoDB connected successfully');
  } catch (primaryError: any) {
    console.warn(`[Database] Warning: Failed to connect to primary MongoDB URI (${primaryError.message}).`);

    // If primary was already local, rethrow
    if (primaryUri === localFallbackUri) {
      throw primaryError;
    }

    console.log(`[Database] Attempting seamless fallback to local MongoDB (${localFallbackUri})...`);
    try {
      await mongoose.connect(localFallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[Database] Local MongoDB connected successfully as fallback');
    } catch (fallbackError: any) {
      console.error('[Database] Local fallback connection also failed:', fallbackError.message);
      throw primaryError;
    }
  }
}

async function bootstrap() {
  try {
    await connectDatabase();

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
