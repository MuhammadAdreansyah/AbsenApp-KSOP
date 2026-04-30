import { RateLimiter } from "limiter";
import { logger } from "./logger";

// Configure rate limiters for different endpoints
const rateLimiters = new Map<string, RateLimiter>();

/**
 * Create or get a rate limiter for a specific endpoint
 * @param key - Unique key for the rate limiter (e.g., "api-pdf", "api-attendance")
 * @param requestsPerMinute - Number of requests allowed per minute
 * @returns Rate limiter instance
 */
function getOrCreateRateLimiter(key: string, requestsPerMinute: number): RateLimiter {
  if (rateLimiters.has(key)) {
    return rateLimiters.get(key)!;
  }

  // limiter: X requests per minute
  const limiter = new RateLimiter({
    tokensPerInterval: requestsPerMinute,
    interval: "minute",
  });

  rateLimiters.set(key, limiter);
  return limiter;
}

/**
 * Check if request is allowed under rate limit
 * @param ipAddress - Client IP address
 * @param endpoint - API endpoint key
 * @param requestsPerMinute - Allowed requests per minute (default: 100)
 * @returns { allowed: boolean, remaining: number, retryAfter: number }
 */
export async function checkRateLimit(
  ipAddress: string,
  endpoint: string = "default",
  requestsPerMinute: number = 100
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const key = `${endpoint}:${ipAddress}`;
  const limiter = getOrCreateRateLimiter(endpoint, requestsPerMinute);

  try {
    const allowed = await limiter.tryRemoveTokens(1);

    if (!allowed) {
      logger.warn(
        { ip: ipAddress, endpoint, timestamp: new Date().toISOString() },
        `Rate limit exceeded for ${endpoint}`
      );
      return {
        allowed: false,
        remaining: 0,
        retryAfter: 60,
      };
    }

    return {
      allowed: true,
      remaining: requestsPerMinute - 1,
      retryAfter: 0,
    };
  } catch (error) {
    logger.error({ error, endpoint }, "Rate limiter error");
    // On error, allow request to pass through
    return {
      allowed: true,
      remaining: requestsPerMinute,
      retryAfter: 0,
    };
  }
}

/**
 * Get client IP address from request
 * @param request - Next.js Request object
 * @returns Client IP address
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const clientIp = request.headers.get("x-client-ip");
  if (clientIp) {
    return clientIp;
  }

  // Fallback to socket address (only works in Node.js environment)
  return "unknown";
}
