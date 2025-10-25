import { SecurityService } from '@/services/securityService';
import { UserRole } from '@/types/database';
import { 
  isApiRateLimited as redisIsApiRateLimited,
  recordApiRequest as redisRecordApiRequest
} from '@/services/redisRateLimiter';

// Fallback in-memory store for API rate limiting
const apiRateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration for API requests
const API_RATE_LIMIT_CONFIG = {
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  feedback: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
  },
  auth: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  }
};

export class SecurityMiddleware {
  // Check if an IP is rate limited for API requests
  static async isRateLimited(
    ip: string, 
    endpoint: string, 
    role: UserRole | 'anonymous' = 'anonymous'
  ): Promise<{ isLimited: boolean; retryAfter?: number }> {
    // Try Redis-based rate limiting first
    const redisResult = await redisIsApiRateLimited(ip, endpoint, role);
    if (redisResult.isLimited && redisResult.retryAfter) {
      return { isLimited: true, retryAfter: redisResult.retryAfter };
    }
    
    // Fallback to in-memory store
    // Determine rate limit config based on endpoint
    let config = API_RATE_LIMIT_CONFIG.general;
    if (endpoint.includes('/auth')) {
      config = API_RATE_LIMIT_CONFIG.auth;
    } else if (endpoint.includes('/feedback')) {
      config = API_RATE_LIMIT_CONFIG.feedback;
    }
    
    const key = `${endpoint}:${ip}`;
    const limit = apiRateLimitStore.get(key);
    
    if (!limit) return { isLimited: false };
    
    const now = Date.now();
    if (now > limit.resetTime) {
      apiRateLimitStore.delete(key);
      return { isLimited: false };
    }
    
    if (limit.count >= config.maxRequests) {
      const retryAfter = Math.ceil((limit.resetTime - now) / 1000);
      return { isLimited: true, retryAfter };
    }
    
    return { isLimited: false };
  }

  // Record an API request for rate limiting
  static async recordRequest(
    ip: string, 
    endpoint: string, 
    role: UserRole | 'anonymous' = 'anonymous'
  ): Promise<void> {
    // Record in Redis
    await redisRecordApiRequest(ip, endpoint, role);
    
    // Also record in in-memory store as fallback
    // Determine rate limit config based on endpoint
    let config = API_RATE_LIMIT_CONFIG.general;
    if (endpoint.includes('/auth')) {
      config = API_RATE_LIMIT_CONFIG.auth;
    } else if (endpoint.includes('/feedback')) {
      config = API_RATE_LIMIT_CONFIG.feedback;
    }
    
    const key = `${endpoint}:${ip}`;
    const now = Date.now();
    
    const limit = apiRateLimitStore.get(key);
    
    if (!limit || now > limit.resetTime) {
      apiRateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
    } else {
      apiRateLimitStore.set(key, {
        count: limit.count + 1,
        resetTime: limit.resetTime
      });
    }
  }

  // Sanitize request data to prevent injection attacks
  static sanitizeRequestData(data: any): any {
    if (typeof data === 'string') {
      return SecurityService.sanitizeInput(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeRequestData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  // Validate request headers for security
  static validateHeaders(headers: Headers): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-for',
      'client-ip',
      'x-client-ip',
      'x-real-ip'
    ];
    
    for (const header of suspiciousHeaders) {
      if (headers.has(header)) {
        // Log suspicious header but don't necessarily block
        console.warn(`Suspicious header detected: ${header}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate security headers for responses
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  }
}