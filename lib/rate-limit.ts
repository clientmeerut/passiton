// Simple rate limiting for API routes
import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60 * 60 * 1000);

export function rateLimit(
  req: NextRequest,
  limit: number = 10,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remaining: number } {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return { success: true, remaining: limit };
  }

  const ip = req.headers.get('x-forwarded-for') ||
             req.headers.get('x-real-ip') ||
             'unknown';

  const key = `${ip}-${req.nextUrl.pathname}`;
  const now = Date.now();
  const resetTime = now + windowMs;

  if (!store[key] || store[key].resetTime < now) {
    store[key] = { count: 1, resetTime };
    return { success: true, remaining: limit - 1 };
  }

  store[key].count++;

  if (store[key].count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - store[key].count };
}