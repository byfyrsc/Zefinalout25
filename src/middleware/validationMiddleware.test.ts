import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  sanitizeBody, 
  sanitizeQuery, 
  sanitizeParams,
  validateEmailFormat,
  validatePasswordStrength
} from './validationMiddleware';

describe('ValidationMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sanitizeBody', () => {
    it('should sanitize request body', () => {
      const req: any = {
        body: {
          name: '<script>alert("xss")</script>',
          description: 'Normal text'
        }
      };
      
      const next = vi.fn();
      
      sanitizeBody(req, null, next);
      
      expect(req.sanitizedBody).toBeDefined();
      expect(req.sanitizedBody.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(req.sanitizedBody.description).toBe('Normal text');
      expect(next).toHaveBeenCalled();
    });

    it('should handle invalid JSON in body', () => {
      const req: any = {
        body: '{"invalid": json}' // Invalid JSON
      };
      
      const next = vi.fn();
      
      sanitizeBody(req, null, next);
      
      // Should use original body when parsing fails
      expect(req.sanitizedBody).toBe(req.body);
      expect(next).toHaveBeenCalled();
    });

    it('should handle empty body', () => {
      const req: any = {
        body: null
      };
      
      const next = vi.fn();
      
      sanitizeBody(req, null, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('sanitizeQuery', () => {
    it('should sanitize query parameters', () => {
      const req: any = {
        query: {
          search: '<script>alert("xss")</script>',
          category: 'normal'
        }
      };
      
      const next = vi.fn();
      
      sanitizeQuery(req, null, next);
      
      expect(req.sanitizedQuery).toBeDefined();
      expect(req.sanitizedQuery.search).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(req.sanitizedQuery.category).toBe('normal');
      expect(next).toHaveBeenCalled();
    });

    it('should handle non-string query parameters', () => {
      const req: any = {
        query: {
          id: 123,
          active: true,
          search: '<script>alert("xss")</script>'
        }
      };
      
      const next = vi.fn();
      
      sanitizeQuery(req, null, next);
      
      expect(req.sanitizedQuery).toBeDefined();
      expect(req.sanitizedQuery.id).toBe(123);
      expect(req.sanitizedQuery.active).toBe(true);
      expect(req.sanitizedQuery.search).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(next).toHaveBeenCalled();
    });

    it('should handle empty query', () => {
      const req: any = {
        query: null
      };
      
      const next = vi.fn();
      
      sanitizeQuery(req, null, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('sanitizeParams', () => {
    it('should sanitize route parameters', () => {
      const req: any = {
        params: {
          id: '<script>alert("xss")</script>',
          name: 'normal'
        }
      };
      
      const next = vi.fn();
      
      sanitizeParams(req, null, next);
      
      expect(req.sanitizedParams).toBeDefined();
      expect(req.sanitizedParams.id).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(req.sanitizedParams.name).toBe('normal');
      expect(next).toHaveBeenCalled();
    });

    it('should handle non-string parameters', () => {
      const req: any = {
        params: {
          id: 123,
          name: '<script>alert("xss")</script>'
        }
      };
      
      const next = vi.fn();
      
      sanitizeParams(req, null, next);
      
      expect(req.sanitizedParams).toBeDefined();
      expect(req.sanitizedParams.id).toBe(123);
      expect(req.sanitizedParams.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(next).toHaveBeenCalled();
    });

    it('should handle empty params', () => {
      const req: any = {
        params: null
      };
      
      const next = vi.fn();
      
      sanitizeParams(req, null, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateEmailFormat', () => {
    it('should pass validation for valid email', () => {
      const req: any = {
        body: {
          email: 'test@example.com'
        }
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      
      validateEmailFormat(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation for invalid email', () => {
      const req: any = {
        body: {
          email: 'invalid-email'
        }
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      
      validateEmailFormat(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid email format'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass validation when no email is provided', () => {
      const req: any = {
        body: {
          name: 'Test User'
        }
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      
      validateEmailFormat(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('validatePasswordStrength', () => {
    it('should pass validation for strong password', () => {
      const req: any = {
        body: {
          password: 'MyStr0ng!Pass'
        }
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      
      validatePasswordStrength(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation for weak password', () => {
      const req: any = {
        body: {
          password: 'weak'
        }
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      
      validatePasswordStrength(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Password does not meet requirements',
        details: expect.arrayContaining([
          'Password must be at least 8 characters long',
          'Password must contain at least one uppercase letter',
          'Password must contain at least one lowercase letter',
          'Password must contain at least one number',
          'Password must contain at least one special character'
        ])
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass validation when no password is provided', () => {
      const req: any = {
        body: {
          email: 'test@example.com'
        }
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      
      validatePasswordStrength(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});