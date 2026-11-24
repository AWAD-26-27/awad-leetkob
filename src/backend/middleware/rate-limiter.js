import { problem } from './rfc7807.js';

// In-memory sliding window store: Map<key, Array<timestamp>>
const attempts = new Map();

/**
 * Reset all tracked rate limits (useful in tests).
 */
export function resetRateLimits() {
  attempts.clear();
}

/**
 * Simple in-memory rate limiter for brute-force protection.
 * @param {object} options
 * @param {number} options.windowMs Window duration in milliseconds (default 60,000 = 1 min)
 * @param {number} options.max Max requests allowed within window (default 10)
 */
export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs ?? 60000;
  const max = options.max ?? 10;

  return function rateLimiterMiddleware(req, res, next) {
    // In test environment, bypass unless rate-limit testing is enabled
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next ? next() : true;
    }

    const clientIp = req.socket?.remoteAddress || '127.0.0.1';
    const path = req.url ? req.url.split('?')[0] : '';
    const key = `${clientIp}:${path}`;
    const now = Date.now();

    const clientHistory = attempts.get(key) || [];
    // Filter out attempts outside the current sliding window
    const recent = clientHistory.filter((ts) => now - ts < windowMs);

    if (recent.length >= max) {
      const oldest = recent[0];
      const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      problem(res, 429, 'rate-limited', `Too many requests. Please try again in ${retryAfterSeconds} seconds.`);
      return false;
    }

    recent.push(now);
    attempts.set(key, recent);

    if (next) next();
    return true;
  };
}
