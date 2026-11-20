import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetAt: number;
}

// Global in-memory storage (persists across hot-reloads via globalThis in Node runtime)
const rateLimitMap: Map<string, RateLimitStore> =
  (globalThis as any).__fintrackRateLimitMap || new Map();
(globalThis as any).__fintrackRateLimitMap = rateLimitMap;

// Periodic cleanup every 5 minutes to avoid memory leaks
if (!(globalThis as any).__fintrackRateLimitCleanup) {
  (globalThis as any).__fintrackRateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function getClientIp(req: Request | NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number; // in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const { limit, windowMs } = options;

  let record = rateLimitMap.get(identifier);

  if (!record || record.resetAt <= now) {
    record = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitMap.set(identifier, record);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: record.resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetAt,
  };
}

export function rateLimitResponse(resetAt: number): NextResponse {
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    {
      message: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
      },
    }
  );
}

interface FailedAttemptsStore {
  attempts: number;
  lockedUntil: number;
}

const failedAttemptsMap: Map<string, FailedAttemptsStore> =
  (globalThis as any).__fintrackFailedAttemptsMap || new Map();
(globalThis as any).__fintrackFailedAttemptsMap = failedAttemptsMap;

export function recordFailedAttempt(
  key: string,
  maxAttempts: number = 5,
  lockoutDurationMs: number = 15 * 60 * 1000
): { locked: boolean; attemptsLeft: number } {
  const now = Date.now();
  let record = failedAttemptsMap.get(key);

  if (!record || (record.lockedUntil > 0 && record.lockedUntil <= now)) {
    record = {
      attempts: 1,
      lockedUntil: 0,
    };
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockoutDurationMs;
    failedAttemptsMap.set(key, record);
    return { locked: true, attemptsLeft: 0 };
  }

  failedAttemptsMap.set(key, record);
  return { locked: false, attemptsLeft: maxAttempts - record.attempts };
}

export function isLockedOut(key: string): { locked: boolean; lockedUntil: number } {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);
  if (record && record.lockedUntil > now) {
    return { locked: true, lockedUntil: record.lockedUntil };
  }
  return { locked: false, lockedUntil: 0 };
}

export function clearFailedAttempts(key: string): void {
  failedAttemptsMap.delete(key);
}
