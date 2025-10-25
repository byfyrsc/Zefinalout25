import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export class SessionService {
  private static sessionTimer: NodeJS.Timeout | null = null;
  private static sessionWarningTimer: NodeJS.Timeout | null = null;
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiration

  // Initialize session management
  static initSessionManagement() {
    this.resetSessionTimer();
    
    // Listen for user activity to reset session timer
    this.setupActivityListeners();
  }

  // Reset session timer
  static resetSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer);
    }
    
    // Set warning timer
    this.sessionWarningTimer = setTimeout(() => {
      toast.warning('Sua sessão expirará em 5 minutos. Salve seu trabalho.', {
        duration: 10000
      });
    }, this.SESSION_TIMEOUT - this.SESSION_WARNING_TIME);
    
    // Set expiration timer
    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpiration();
    }, this.SESSION_TIMEOUT);
  }

  // Handle session expiration
  static async handleSessionExpiration() {
    try {
      await supabase.auth.signOut();
      toast.error('Sua sessão expirou. Por favor, faça login novamente.');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during session expiration:', error);
      // Force redirect to login even if signOut fails
      window.location.href = '/login';
    }
  }

  // Set up activity listeners to reset session timer
  static setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      this.resetSessionTimer();
    };
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });
  }

  // Get session expiration time
  static async getSessionExpiration(): Promise<number | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.expires_at) {
        return session.expires_at * 1000; // Convert to milliseconds
      }
      return null;
    } catch (error) {
      console.error('Error getting session expiration:', error);
      return null;
    }
  }

  // Check if session is about to expire
  static async isSessionExpiringSoon(): Promise<boolean> {
    const expirationTime = await this.getSessionExpiration();
    if (!expirationTime) return false;
    
    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;
    
    // Consider session expiring soon if less than 10 minutes remain
    return timeUntilExpiration < 10 * 60 * 1000;
  }

  // Extend session (if supported by auth provider)
  static async extendSession(): Promise<boolean> {
    try {
      // Attempt to refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (data.session) {
        this.resetSessionTimer();
        toast.success('Sessão estendida com sucesso');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  }

  // Clean up session management
  static cleanup() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer);
      this.sessionWarningTimer = null;
    }
  }
}