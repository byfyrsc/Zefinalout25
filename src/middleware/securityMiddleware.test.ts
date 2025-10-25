import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityMiddleware } from './securityMiddleware';
import { SecurityService } from '@/services/securityService';

describe('SecurityMiddleware', () => {
  beforeEach(() => {
    // Clear all rate limit data before each test
    const apiRateLimitStore = (SecurityMiddleware as any).apiRateLimitStore;
    apiRateLimitStore.clear();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('isRateLimited', () => {
    it('should return false when no requests have been made', () => {
      const result = SecurityMiddleware.isRateLimited('127.0.0.1', '/api/test');
      expect(result.isLimited).toBe(false);
    });

    it('should return false when requests are below the limit', () => {
      // Record 50 requests (general limit is 100)
      for (let i = 0; i < 50; i++) {
        SecurityMiddleware.recordRequest('127.0.0.1', '/api/test');
      }
      
      const result = SecurityMiddleware.isRateLimited('127.0.0.1', '/api/test');
      expect(result.isLimited).toBe(false);
    });

    it('should return true when requests exceed the general limit', () => {
      // Record 150 requests (general limit is 100)
      for (let i = 0; i < 150; i++) {
        SecurityMiddleware.recordRequest('127.0.0.1', '/api/test');
      }
      
      const result = SecurityMiddleware.isRateLimited('127.0.0.1', '/api/test');
      expect(result.isLimited).toBe(true);
    });

    it('should return true when requests exceed the auth limit', () => {
      // Record 30 requests (auth limit is 20)
      for (let i = 0; i < 30; i++) {
        SecurityMiddleware.recordRequest('127.0.0.1', '/api/auth/login');
      }
      
      const result = SecurityMiddleware.isRateLimited('127.0.0.1', '/api/auth/login');
      expect(result.isLimited).toBe(true);
    });

    it('should return true when requests exceed the feedback limit', () => {
      // Record 60 requests (feedback limit is 50)
      for (let i = 0; i < 60; i++) {
        SecurityMiddleware.recordRequest('127.0.0.1', '/api/feedback/submit');
      }
      
      const result = SecurityMiddleware.isRateLimited('127.0.0.1', '/api/feedback/submit');
      expect(result.isLimited).toBe(true);
    });
  });

  describe('sanitizeRequestData', () => {
    it('should sanitize string data', () => {
      const input = '<script>alert("xss")</script>';
      const result = SecurityMiddleware.sanitizeRequestData(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should sanitize array data', () => {
      const input = ['<script>alert("xss")</script>', 'normal text'];
      const result = SecurityMiddleware.sanitizeRequestData(input);
      expect(result).toEqual([
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        'normal text'
      ]);
    });

    it('should sanitize object data', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        description: 'normal text',
        nested: {
          value: '<img src=x onerror=alert("xss")>'
        }
      };
      
      const result = SecurityMiddleware.sanitizeRequestData(input);
      expect(result).toEqual({
        name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
        description: 'normal text',
        nested: {
          value: '&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;'
        }
      });
    });

    it('should return primitive values unchanged', () => {
      expect(SecurityMiddleware.sanitizeRequestData(42)).toBe(42);
      expect(SecurityMiddleware.sanitizeRequestData(true)).toBe(true);
      expect(SecurityMiddleware.sanitizeRequestData(null)).toBe(null);
      expect(SecurityMiddleware.sanitizeRequestData(undefined)).toBe(undefined);
    });
  });

  describe('validateHeaders', () => {
    it('should validate headers without suspicious ones', () => {
      const headers = new Headers();
      headers.set('content-type', 'application/json');
      headers.set('authorization', 'Bearer token');
      
      const result = SecurityMiddleware.validateHeaders(headers);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect suspicious headers', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const headers = new Headers();
      headers.set('content-type', 'application/json');
      headers.set('x-forwarded-for', '127.0.0.1');
      
      const result = SecurityMiddleware.validateHeaders(headers);
      expect(result.isValid).toBe(true); // Still valid, just logs warning
      expect(consoleSpy).toHaveBeenCalledWith('Suspicious header detected: x-forwarded-for');
      
      consoleSpy.mockRestore();
    });
  });

  describe('getSecurityHeaders', () => {
    it('should return security headers', () => {
      const headers = SecurityMiddleware.getSecurityHeaders();
      
      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff');
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY');
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block');
      expect(headers).toHaveProperty('Strict-Transport-Security');
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('Referrer-Policy');
    });
  });
});