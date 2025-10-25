import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  RateLimitError,
  errorHandler,
  catchAsync,
  notFoundHandler
} from './errorHandler';

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with custom values', () => {
      const error = new AppError('Test error', 400, false);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with status 400', () => {
      const error = new ValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with status 401', () => {
      const error = new AuthenticationError('Auth failed');
      expect(error.message).toBe('Auth failed');
      expect(error.statusCode).toBe(401);
    });

    it('should create an AuthenticationError with default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('should create an AuthorizationError with status 403', () => {
      const error = new AuthorizationError('Access denied');
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
    });

    it('should create an AuthorizationError with default message', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with status 404', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create a NotFoundError with default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('RateLimitError', () => {
    it('should create a RateLimitError with status 429', () => {
      const error = new RateLimitError('Too many requests');
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
    });

    it('should create a RateLimitError with default message', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('errorHandler', () => {
    it('should handle generic errors', () => {
      const req: any = {
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        get: vi.fn().mockReturnValue('Test Agent')
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      const error = new Error('Test error');
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Test error'
      });
    });

    it('should handle AppError instances', () => {
      const req: any = {
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        get: vi.fn().mockReturnValue('Test Agent')
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      const error = new AppError('App error', 400);
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'App error'
      });
    });

    it('should handle CastError', () => {
      const req: any = {
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        get: vi.fn().mockReturnValue('Test Agent')
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      const error: any = new Error('Cast error');
      error.name = 'CastError';
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Resource not found'
      });
    });

    it('should handle duplicate key errors', () => {
      const req: any = {
        url: '/test',
        method: 'GET',
        ip: '127.0.0.1',
        get: vi.fn().mockReturnValue('Test Agent')
      };
      
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      
      const next = vi.fn();
      const error: any = new Error('Duplicate key');
      error.code = 11000;
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate field value entered'
      });
    });
  });

  describe('catchAsync', () => {
    it('should wrap async functions and catch errors', async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error('Async error'));
      const wrappedFn = catchAsync(asyncFn);
      
      const req: any = {};
      const res: any = {};
      const next = vi.fn();
      
      await wrappedFn(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error when async function throws', async () => {
      const asyncFn = vi.fn().mockImplementation(async () => {
        throw new Error('Sync error');
      });
      const wrappedFn = catchAsync(asyncFn);
      
      const req: any = {};
      const res: any = {};
      const next = vi.fn();
      
      await wrappedFn(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('notFoundHandler', () => {
    it('should create a NotFoundError for unmatched routes', () => {
      const req: any = {
        originalUrl: '/nonexistent'
      };
      
      const res: any = {};
      const next = vi.fn();
      
      notFoundHandler(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });
  });
});