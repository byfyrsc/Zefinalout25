import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityService } from './securityService';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: null, error: null })
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}));

describe('SecurityService', () => {
  beforeEach(() => {
    // Clear all rate limit data before each test
    const rateLimitStore = (SecurityService as any).rateLimitStore;
    rateLimitStore.clear();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('isAuthRateLimited', () => {
    it('should return false when no attempts have been made', () => {
      const result = SecurityService.isAuthRateLimited('127.0.0.1');
      expect(result).toBe(false);
    });

    it('should return false when attempts are below the limit', () => {
      // Record 3 attempts (limit is 5)
      for (let i = 0; i < 3; i++) {
        SecurityService.recordAuthAttempt('127.0.0.1');
      }
      
      const result = SecurityService.isAuthRateLimited('127.0.0.1');
      expect(result).toBe(false);
    });

    it('should return true when attempts exceed the limit', () => {
      // Record 6 attempts (limit is 5)
      for (let i = 0; i < 6; i++) {
        SecurityService.recordAuthAttempt('127.0.0.1');
      }
      
      const result = SecurityService.isAuthRateLimited('127.0.0.1');
      expect(result).toBe(true);
    });

    it('should reset rate limit after window expires', () => {
      // Mock Date.now to control time
      const now = Date.now();
      vi.spyOn(global.Date, 'now').mockImplementation(() => now);
      
      // Record 6 attempts to exceed limit
      for (let i = 0; i < 6; i++) {
        SecurityService.recordAuthAttempt('127.0.0.1');
      }
      
      // Should be rate limited
      expect(SecurityService.isAuthRateLimited('127.0.0.1')).toBe(true);
      
      // Move time forward past the window
      vi.spyOn(global.Date, 'now').mockImplementation(() => now + 16 * 60 * 1000);
      
      // Should no longer be rate limited
      expect(SecurityService.isAuthRateLimited('127.0.0.1')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = SecurityService.validatePassword('MyStr0ng!Pass');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password that is too short', () => {
      const result = SecurityService.validatePassword('Sh0rt!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = SecurityService.validatePassword('mypassw0rd!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = SecurityService.validatePassword('MYPASSW0RD!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = SecurityService.validatePassword('MyPassword!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = SecurityService.validatePassword('MyPassw0rd');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const result = SecurityService.sanitizeInput(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should sanitize quotes', () => {
      const input = 'Text with "quotes" and \'apostrophes\'';
      const result = SecurityService.sanitizeInput(input);
      expect(result).toBe('Text with &quot;quotes&quot; and &#x27;apostrophes&#x27;');
    });

    it('should return empty string when input is empty', () => {
      const result = SecurityService.sanitizeInput('');
      expect(result).toBe('');
    });

    it('should return undefined when input is undefined', () => {
      const result = SecurityService.sanitizeInput(undefined as any);
      expect(result).toBeUndefined();
    });
  });

  describe('validateEmail', () => {
    it('should validate a correct email format', () => {
      const result = SecurityService.validateEmail('test@example.com');
      expect(result).toBe(true);
    });

    it('should reject an incorrect email format', () => {
      const result = SecurityService.validateEmail('invalid-email');
      expect(result).toBe(false);
    });

    it('should reject empty string', () => {
      const result = SecurityService.validateEmail('');
      expect(result).toBe(false);
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security events', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await SecurityService.logSecurityEvent(
        'TEST_EVENT',
        'user-123',
        '127.0.0.1',
        { action: 'test' }
      );
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});