import { describe, it, expect } from 'vitest';
import { hasRole, hasPermission } from '@/lib/authHelpers';

// Mock user data for testing
const mockUser = {
  id: 'user-1',
  tenant_id: 'tenant-1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'admin' as const,
  permissions: {
    manage_users: true,
    manage_locations: false,
    view_analytics: true
  },
  is_active: true,
  created_at: '2024-01-15',
  updated_at: '2024-01-15',
  supabaseUser: {
    id: 'user-1',
    email: 'test@example.com',
  },
  tenant: {
    id: 'tenant-1',
    name: 'Test Tenant',
    subdomain: 'testtenant',
    settings: {},
    is_active: true,
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  }
};

describe('AuthContext Helper Functions', () => {
  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      const result = hasRole(mockUser, 'admin');
      expect(result).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      const result = hasRole(mockUser, 'manager');
      expect(result).toBe(false);
    });

    it('should return false when user is null', () => {
      const result = hasRole(null, 'admin');
      expect(result).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has the specified permission', () => {
      const result = hasPermission(mockUser, 'manage_users');
      expect(result).toBe(true);
    });

    it('should return false when user does not have the specified permission', () => {
      const result = hasPermission(mockUser, 'manage_locations');
      expect(result).toBe(false);
    });

    it('should return false when user is null', () => {
      const result = hasPermission(null, 'manage_users');
      expect(result).toBe(false);
    });

    it('should return false when user has no permissions', () => {
      const userWithoutPermissions = { ...mockUser, permissions: undefined };
      const result = hasPermission(userWithoutPermissions, 'manage_users');
      expect(result).toBe(false);
    });
  });
});