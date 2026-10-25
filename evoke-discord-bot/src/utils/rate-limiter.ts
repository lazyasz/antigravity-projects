/**
 * In-Memory Token Bucket / Cooldown Rate Limiter
 */

interface RateLimitEntry {
  lastActionTimestamp: number;
  attempts: number;
}

export class RateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map();
  private cooldownMs: number;

  constructor(cooldownMs: number = 3000) {
    this.cooldownMs = cooldownMs;

    // Periodic cleanup of stale entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.lastActionTimestamp > this.cooldownMs * 5) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  /**
   * Checks if an action is rate limited for a given key (e.g. userId:action).
   * If allowed, updates the timestamp and returns true. If limited, returns false.
   */
  public isAllowed(key: string): { allowed: boolean; remainingSeconds: number } {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.cache.set(key, { lastActionTimestamp: now, attempts: 1 });
      return { allowed: true, remainingSeconds: 0 };
    }

    const elapsed = now - entry.lastActionTimestamp;
    if (elapsed < this.cooldownMs) {
      const remainingSeconds = Math.ceil((this.cooldownMs - elapsed) / 1000);
      return { allowed: false, remainingSeconds };
    }

    entry.lastActionTimestamp = now;
    entry.attempts += 1;
    return { allowed: true, remainingSeconds: 0 };
  }

  public reset(key: string): void {
    this.cache.delete(key);
  }
}

export const interactionRateLimiter = new RateLimiter(2500);
export const registrationRateLimiter = new RateLimiter(5000);
