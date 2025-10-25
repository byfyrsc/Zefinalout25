import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generalRateLimiter, 
  authRateLimiter, 
  feedbackRateLimiter,
  strictRateLimiter,
  planBasedRateLimiter
} from './apiRateLimit';

describe('API Rate Limit Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generalRateLimiter', () => {
    it('should be defined', () => {
      expect(generalRateLimiter).toBeDefined();
    });
  });

  describe('authRateLimiter', () => {
    it('should be defined', () => {
      expect(authRateLimiter).toBeDefined();
    });
  });

  describe('feedbackRateLimiter', () => {
    it('should be defined', () => {
      expect(feedbackRateLimiter).toBeDefined();
    });
  });

  describe('strictRateLimiter', () => {
    it('should be defined', () => {
      expect(strictRateLimiter).toBeDefined();
    });
  });

  describe('planBasedRateLimiter', () => {
    it('should be a function', () => {
      expect(typeof planBasedRateLimiter).toBe('function');
    });
  });
});