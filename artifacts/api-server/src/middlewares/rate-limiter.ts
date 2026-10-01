/**
 * @file rate-limiter.ts
 * @description In-memory sliding-window rate limiter middleware for Express,
 * protecting verification endpoints and providing standard X-RateLimit headers.
 */

import type { Request, Response, NextFunction } from 'express';

interface RateRecord {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute per IP
const clients = new Map<string, RateRecord>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = clients.get(ip);

  if (!record || now > record.resetAt) {
    clients.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS
    });
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
    res.setHeader('X-RateLimit-Remaining', (MAX_REQUESTS - 1).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + WINDOW_MS) / 1000).toString());
    return next();
  }

  record.count++;

  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000).toString());

  if (record.count > MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait before submitting more verification requests.',
      messageAr: 'تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً قبل إعادة الفحص.',
      retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000)
    });
    return;
  }

  next();
}
