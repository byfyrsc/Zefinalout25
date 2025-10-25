import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSecurity } from './useSecurity';
import { SecurityService } from '@/services/securityService';

// Mock AuthContext
const mockAuthContext = {
  isRateLimited: vi.fn(),
  isSessionExpiringSoon: vi.fn(),
  extendSession: vi.fn()
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

describe('useSecurity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isRateLimited', () => {
    it('should return the rate limited status from auth context', () => {
      mockAuthContext.isRateLimited.mockReturnValue(true);
      
      const { result } = renderHook(() => useSecurity());
      
      expect(result.current.isRateLimited).toBe(true);
      expect(mockAuthContext.isRateLimited).toHaveBeenCalled();
    });
  });

  describe('isSessionExpiringSoon', () => {
    it('should return false when session is not expiring soon', async () => {
      mockAuthContext.isSessionExpiringSoon.mockResolvedValue(false);
      
      const { result } = renderHook(() => useSecurity());
      
      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.isSessionExpiringSoon).toBe(false);
    });

    it('should return true when session is expiring soon', async () => {
      mockAuthContext.isSessionExpiringSoon.mockResolvedValue(true);
      
      const { result } = renderHook(() => useSecurity());
      
      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.isSessionExpiringSoon).toBe(true);
    });
  });

  describe('showSessionWarning', () => {
    it('should show session warning when session is expiring soon', async () => {
      mockAuthContext.isSessionExpiringSoon.mockResolvedValue(true);
      
      const { result } = renderHook(() => useSecurity());
      
      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.showSessionWarning).toBe(true);
    });

    it('should not show session warning when session is not expiring soon', async () => {
      mockAuthContext.isSessionExpiringSoon.mockResolvedValue(false);
      
      const { result } = renderHook(() => useSecurity());
      
      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.showSessionWarning).toBe(false);
    });
  });

  describe('dismissSessionWarning', () => {
    it('should dismiss the session warning', async () => {
      mockAuthContext.isSessionExpiringSoon.mockResolvedValue(true);
      
      const { result } = renderHook(() => useSecurity());
      
      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.showSessionWarning).toBe(true);
      
      act(() => {
        result.current.dismissSessionWarning();
      });
      
      expect(result.current.showSessionWarning).toBe(false);
    });
  });

  describe('extendSession', () => {
    it('should extend the session successfully', async () => {
      mockAuthContext.extendSession.mockResolvedValue(true);
      
      const { result } = renderHook(() => useSecurity());
      
      let success;
      await act(async () => {
        success = await result.current.extendSession();
      });
      
      expect(success).toBe(true);
      expect(mockAuthContext.extendSession).toHaveBeenCalled();
      expect(result.current.showSessionWarning).toBe(false);
    });

    it('should handle session extension failure', async () => {
      mockAuthContext.extendSession.mockResolvedValue(false);
      
      const { result } = renderHook(() => useSecurity());
      
      let success;
      await act(async () => {
        success = await result.current.extendSession();
      });
      
      expect(success).toBe(false);
      expect(mockAuthContext.extendSession).toHaveBeenCalled();
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize input using SecurityService', () => {
      const spy = vi.spyOn(SecurityService, 'sanitizeInput').mockReturnValue('sanitized');
      
      const { result } = renderHook(() => useSecurity());
      
      const sanitized = result.current.sanitizeInput('<script>alert("xss")</script>');
      
      expect(sanitized).toBe('sanitized');
      expect(spy).toHaveBeenCalledWith('<script>alert("xss")</script>');
      
      spy.mockRestore();
    });
  });

  describe('validateEmail', () => {
    it('should validate email using SecurityService', () => {
      const spy = vi.spyOn(SecurityService, 'validateEmail').mockReturnValue(true);
      
      const { result } = renderHook(() => useSecurity());
      
      const isValid = result.current.validateEmail('test@example.com');
      
      expect(isValid).toBe(true);
      expect(spy).toHaveBeenCalledWith('test@example.com');
      
      spy.mockRestore();
    });
  });

  describe('validatePassword', () => {
    it('should validate password using SecurityService', () => {
      const validationResponse = { valid: true, errors: [] };
      const spy = vi.spyOn(SecurityService, 'validatePassword').mockReturnValue(validationResponse);
      
      const { result } = renderHook(() => useSecurity());
      
      const validation = result.current.validatePassword('MyStr0ng!Pass');
      
      expect(validation).toEqual(validationResponse);
      expect(spy).toHaveBeenCalledWith('MyStr0ng!Pass');
      
      spy.mockRestore();
    });
  });
});