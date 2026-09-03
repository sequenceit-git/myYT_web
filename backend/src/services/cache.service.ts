import Redis from 'ioredis';
import { config } from '../config/index.js';

class CacheService {
  private redis: Redis | null = null;
  private inMemoryMap: Map<string, { value: string; expiresAt: number }> = new Map();
  private isRedisConnected = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.redis = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't crash or spin if Redis is offline
        lazyConnect: true,
      });

      this.redis.connect()
        .then(() => {
          this.isRedisConnected = true;
          console.log('[CacheService] Connected to Redis successfully');
        })
        .catch(() => {
          this.isRedisConnected = false;
          console.log('[CacheService] Redis offline, running in-memory high-speed fallback mode');
        });

      this.redis.on('error', () => {
        this.isRedisConnected = false;
      });
    } catch {
      this.isRedisConnected = false;
      console.log('[CacheService] Operating with in-memory TTL cache');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        // fallback
      }
    }
    const item = this.inMemoryMap.get(key);
    if (!item) return null;
    if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
      this.inMemoryMap.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        if (ttlSeconds) {
          await this.redis.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.redis.set(key, value);
        }
        return;
      } catch {
        // fallback
      }
    }
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0;
    this.inMemoryMap.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        // fallback
      }
    }
    this.inMemoryMap.delete(key);
  }

  async hasCooldown(userId: string, videoId: string): Promise<boolean> {
    const key = `cooldown:${userId}:${videoId}`;
    const exists = await this.get(key);
    return exists !== null;
  }

  async setCooldown(userId: string, videoId: string, ttlSeconds: number): Promise<void> {
    const key = `cooldown:${userId}:${videoId}`;
    await this.set(key, '1', ttlSeconds);
  }
}

export const cacheService = new CacheService();
