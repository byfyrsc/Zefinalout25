import { describe, it, expect, beforeEach, vi } from 'vitest';
import { securityHeaders, hidePoweredBy } from './securityHeaders';

describe('Security Headers Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('securityHeaders', () => {
    it('should set all security headers', () => {
      const req: any = {};
      const res: any = {
        setHeader: vi.fn(),
        removeHeader: vi.fn()
      };
      const next = vi.fn();
      
      securityHeaders(req, res, next);
      
      // Check that all expected headers are set
      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(res.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', expect.stringContaining("default-src 'self'"));
      expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(res.setHeader).toHaveBeenCalledWith('Permissions-Policy', expect.stringContaining('geolocation=()'));
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('hidePoweredBy', () => {
    it('should remove X-Powered-By header', () => {
      const req: any = {};
      const res: any = {
        removeHeader: vi.fn()
      };
      const next = vi.fn();
      
      hidePoweredBy(req, res, next);
      
      expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
      expect(next).toHaveBeenCalled();
    });
  });
});