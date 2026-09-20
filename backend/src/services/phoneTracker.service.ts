import { Task } from '../models/Task.js';

export interface ActivePhoneSession {
  key: string;
  userId?: string;
  deviceId?: string;
  ip: string;
  platform: string;
  lastSeen: number;
  userAgent?: string;
}

class PhoneTrackerService {
  private sessions = new Map<string, ActivePhoneSession>();

  /**
   * Touch / register an active phone app session
   */
  public recordPhoneActivity(params: {
    userId?: string;
    deviceId?: string;
    ip?: string;
    userAgent?: string;
    platform?: string;
  }): void {
    const ip = params.ip || '127.0.0.1';
    const key = params.userId
      ? `user:${params.userId}`
      : params.deviceId
      ? `device:${params.deviceId}`
      : `ip:${ip}`;

    this.sessions.set(key, {
      key,
      userId: params.userId,
      deviceId: params.deviceId,
      ip,
      platform: params.platform || 'phone-app',
      lastSeen: Date.now(),
      userAgent: params.userAgent,
    });
  }

  /**
   * Remove inactive sessions older than windowMs (default 2 minutes)
   */
  private cleanup(windowMs = 120000): void {
    const cutoff = Date.now() - windowMs;
    for (const [key, session] of this.sessions.entries()) {
      if (session.lastSeen < cutoff) {
        this.sessions.delete(key);
      }
    }
  }

  /**
   * Returns real-time count of unique active phone app users
   */
  public async getCombinedActiveCount(windowMs = 120000): Promise<number> {
    this.cleanup(windowMs);
    const activeKeys = new Set<string>();

    for (const [key] of this.sessions.entries()) {
      activeKeys.add(key);
    }

    // Also include any users who created/completed/updated a task in the last 2 minutes
    try {
      const cutoff = new Date(Date.now() - windowMs);
      const recentTasks = await Task.find({
        updatedAt: { $gte: cutoff },
      })
        .select('viewerId verificationMeta')
        .limit(100);

      for (const t of recentTasks) {
        const isPhone =
          t.verificationMeta?.deviceId &&
          t.verificationMeta?.deviceId !== 'web-simulated' &&
          !t.verificationMeta?.deviceId.includes('web');

        if (isPhone && t.viewerId) {
          activeKeys.add(`user:${t.viewerId.toString()}`);
        }
      }
    } catch {
      // Ignore DB errors during counting
    }

    return activeKeys.size;
  }

  /**
   * Synchronous quick count of current in-memory sessions
   */
  public getMemoryCount(windowMs = 120000): number {
    this.cleanup(windowMs);
    return this.sessions.size;
  }
}

export const phoneTracker = new PhoneTrackerService();
