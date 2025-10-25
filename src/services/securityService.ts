import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UserRole } from '@/types/database';

// Fallback in-memory store for rate limiting (used when Redis is not available)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  authAttempts: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  generalRequests: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  }
};

export class SecurityService {
  // Check if an IP is rate limited for authentication attempts
  static async isAuthRateLimited(ip: string, role: UserRole | 'anonymous' = 'anonymous'): Promise<boolean> {
    // Fallback to in-memory store
    const key = `auth:${ip}`;
    const limit = rateLimitStore.get(key);
    
    if (!limit) return false;
    
    const now = Date.now();
    if (now > limit.resetTime) {
      rateLimitStore.delete(key);
      return false;
    }
    
    return limit.count >= RATE_LIMIT_CONFIG.authAttempts.maxAttempts;
  }

  // Record an authentication attempt
  static async recordAuthAttempt(ip: string, role: UserRole | 'anonymous' = 'anonymous'): Promise<void> {
    // Also record in in-memory store as fallback
    const key = `auth:${ip}`;
    const now = Date.now();
    const windowMs = RATE_LIMIT_CONFIG.authAttempts.windowMs;
    
    const limit = rateLimitStore.get(key);
    
    if (!limit || now > limit.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      rateLimitStore.set(key, {
        count: limit.count + 1,
        resetTime: limit.resetTime
      });
    }
  }

  // Check if an IP is rate limited for general requests
  static async isRequestRateLimited(ip: string, role: UserRole | 'anonymous' = 'anonymous'): Promise<boolean> {
    // Fallback to in-memory store
    const key = `req:${ip}`;
    const limit = rateLimitStore.get(key);
    
    if (!limit) return false;
    
    const now = Date.now();
    if (now > limit.resetTime) {
      rateLimitStore.delete(key);
      return false;
    }
    
    return limit.count >= RATE_LIMIT_CONFIG.generalRequests.maxRequests;
  }

  // Record a general request
  static async recordRequest(ip: string, role: UserRole | 'anonymous' = 'anonymous'): Promise<void> {
    // Also record in in-memory store as fallback
    const key = `req:${ip}`;
    const now = Date.now();
    const windowMs = RATE_LIMIT_CONFIG.generalRequests.windowMs;
    
    const limit = rateLimitStore.get(key);
    
    if (!limit || now > limit.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      rateLimitStore.set(key, {
        count: limit.count + 1,
        resetTime: limit.resetTime
      });
    }
  }

  // Validate password strength
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Sanitize user input to prevent XSS
  static sanitizeInput(input: string): string {
    if (!input) return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Log security events
  static async logSecurityEvent(
    eventType: string,
    userId: string | null,
    ip: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      // In a real implementation, this would log to a security monitoring system
      console.log(`Security Event: ${eventType}`, {
        userId,
        ip,
        timestamp: new Date().toISOString(),
        ...details
      });
      
      // Also store in database for audit trail
      // Using a more generic approach to avoid type issues
      const auditLogData = {
        user_id: userId,
        action: eventType,
        resource_type: 'security',
        resource_id: null,
        details: {
          ip,
          ...details
        },
        ip_address: ip,
        user_agent: navigator?.userAgent || 'Unknown',
        created_at: new Date().toISOString()
      };
      
      // Cast to any to avoid type issues
      const { error } = await (supabase.from('audit_logs') as any).insert([auditLogData]);
      
      if (error) {
        console.error('Failed to insert audit log:', error);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Check if user account is locked
  static async isAccountLocked(userId: string): Promise<boolean> {
    try {
      // Using a more generic approach to avoid type issues
      const { data, error } = await (supabase.from('users') as any)
        .select('is_active')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error checking account lock status:', error);
        return false;
      }
      
      return data && !data.is_active;
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return false;
    }
  }

  // Lock user account after too many failed attempts
  static async lockAccount(userId: string): Promise<void> {
    try {
      // Using a more generic approach to avoid type issues
      const updates = {
        is_active: false,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await (supabase.from('users') as any)
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        console.error('Error locking account:', error);
      } else {
        toast.error('Account locked due to security concerns. Please contact support.');
      }
    } catch (error) {
      console.error('Error locking account:', error);
    }
  }
}