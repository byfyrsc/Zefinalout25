import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SessionService } from './sessionService';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn()
    }
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  }
}));

describe('SessionService', () => {
  beforeEach(() => {
    // Clear all timeouts
    vi.useFakeTimers();
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up timers
    vi.useRealTimers();
    
    // Clean up session service
    SessionService.cleanup();
  });

  describe('initSessionManagement', () => {
    it('should initialize session management', () => {
      const setupSpy = vi.spyOn(SessionService as any, 'setupActivityListeners');
      const resetSpy = vi.spyOn(SessionService as any, 'resetSessionTimer');
      
      SessionService.initSessionManagement();
      
      expect(resetSpy).toHaveBeenCalled();
      expect(setupSpy).toHaveBeenCalled();
      
      setupSpy.mockRestore();
      resetSpy.mockRestore();
    });
  });

  describe('getSessionExpiration', () => {
    it('should return expiration time when session exists', async () => {
      const futureTime = Math.floor((Date.now() + 3600000) / 1000); // 1 hour in the future
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { expires_at: futureTime } }
      });
      
      const result = await SessionService.getSessionExpiration();
      expect(result).toBe(futureTime * 1000);
    });

    it('should return null when no session exists', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null }
      });
      
      const result = await SessionService.getSessionExpiration();
      expect(result).toBeNull();
    });

    it('should return null when there is an error', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.getSession as any).mockRejectedValue(new Error('Test error'));
      
      const result = await SessionService.getSessionExpiration();
      expect(result).toBeNull();
    });
  });

  describe('isSessionExpiringSoon', () => {
    it('should return false when no session exists', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null }
      });
      
      const result = await SessionService.isSessionExpiringSoon();
      expect(result).toBe(false);
    });

    it('should return true when session expires soon', async () => {
      // Set session to expire in 5 minutes
      const futureTime = Math.floor((Date.now() + 4 * 60000) / 1000); // 4 minutes in the future
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { expires_at: futureTime } }
      });
      
      const result = await SessionService.isSessionExpiringSoon();
      expect(result).toBe(true);
    });

    it('should return false when session has plenty of time', async () => {
      // Set session to expire in 30 minutes
      const futureTime = Math.floor((Date.now() + 30 * 60000) / 1000); // 30 minutes in the future
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { expires_at: futureTime } }
      });
      
      const result = await SessionService.isSessionExpiringSoon();
      expect(result).toBe(false);
    });
  });

  describe('extendSession', () => {
    it('should return true when session is successfully extended', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.refreshSession as any).mockResolvedValue({
        data: { session: { expires_at: Date.now() + 3600000 } },
        error: null
      });
      
      const result = await SessionService.extendSession();
      expect(result).toBe(true);
    });

    it('should return false when there is an error extending session', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.refreshSession as any).mockResolvedValue({
        data: { session: null },
        error: new Error('Test error')
      });
      
      const result = await SessionService.extendSession();
      expect(result).toBe(false);
    });

    it('should return false when no session is returned', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.refreshSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      const result = await SessionService.extendSession();
      expect(result).toBe(false);
    });
  });

  describe('handleSessionExpiration', () => {
    it('should call signOut and redirect to login', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.signOut as any).mockResolvedValue({ error: null });
      
      // Mock window.location
      const locationSpy = vi.spyOn(window.location, 'href', 'set');
      
      await SessionService.handleSessionExpiration();
      
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(locationSpy).toHaveBeenCalledWith('/login');
      
      locationSpy.mockRestore();
    });

    it('should redirect to login even if signOut fails', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.signOut as any).mockRejectedValue(new Error('Test error'));
      
      // Mock window.location
      const locationSpy = vi.spyOn(window.location, 'href', 'set');
      
      await SessionService.handleSessionExpiration();
      
      expect(locationSpy).toHaveBeenCalledWith('/login');
      
      locationSpy.mockRestore();
    });
  });
});