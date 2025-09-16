import { describe, it, expect } from 'vitest';
import { hasRole, hasPermission, isOwner, isAdmin, isManager, canManageUsers, canManageLocations, canViewAnalytics } from './authHelpers';
import type { AuthUser } from './authHelpers';

const mockUser: AuthUser = {
  id: 'user-123',
  tenant_id: 'tenant-456',
  email: 'test@example.com',
  role: 'admin',
  permissions: {
    manage_users: true,
    view_analytics: true,
  },
  supabaseUser: {},
  tenant: {},
  profile_data: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login_at: new Date().toISOString(),
  first_name: 'Test',
  last_name: 'User',
  phone: '123-456-7890',
  avatar_url: null,
  preferences: {},
  is_active: true,
  email_verified: true,
};

describe('authHelpers', () => {
  describe('hasRole', () => {
    it('should return true if the user has the specified role', () => {
      expect(hasRole(mockUser, 'admin')).toBe(true);
    });

    it('should return false if the user does not have the specified role', () => {
      expect(hasRole(mockUser, 'manager')).toBe(false);
    });

    it('should return false if the user is null', () => {
      expect(hasRole(null, 'admin')).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if the user has the specified permission', () => {
      expect(hasPermission(mockUser, 'manage_users')).toBe(true);
    });

    it('should return false if the user does not have the specified permission', () => {
      expect(hasPermission(mockUser, 'manage_locations')).toBe(false);
    });

    it('should return false if the user is null', () => {
      expect(hasPermission(null, 'manage_users')).toBe(false);
    });

    it('should return false if the user has no permissions object', () => {
      const userWithoutPermissions = { ...mockUser, permissions: undefined };
      expect(hasPermission(userWithoutPermissions, 'manage_users')).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true for owner role', () => {
      const ownerUser = { ...mockUser, role: 'owner' as const };
      expect(isOwner(ownerUser)).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(isOwner(mockUser)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin(mockUser)).toBe(true);
    });

    it('should return true for owner role', () => {
      const ownerUser = { ...mockUser, role: 'owner' as const };
      expect(isAdmin(ownerUser)).toBe(true);
    });

    it('should return false for manager role', () => {
        const managerUser = { ...mockUser, role: 'manager' as const };
        expect(isAdmin(managerUser)).toBe(false);
    });
  });

  describe('isManager', () => {
    it('should return true for manager role', () => {
        const managerUser = { ...mockUser, role: 'manager' as const };
        expect(isManager(managerUser)).toBe(true);
    });

    it('should return true for admin role', () => {
        expect(isManager(mockUser)).toBe(true);
    });

    it('should return true for owner role', () => {
        const ownerUser = { ...mockUser, role: 'owner' as const };
        expect(isManager(ownerUser)).toBe(true);
    });
  });

  describe('canManageUsers', () => {
    it('should return true for admin', () => {
        expect(canManageUsers(mockUser)).toBe(true);
    });
    it('should return true for user with permission', () => {
        const userWithPerm = { ...mockUser, role: 'manager' as const, permissions: { manage_users: true } };
        expect(canManageUsers(userWithPerm)).toBe(true);
    });
  });

  describe('canManageLocations', () => {
    it('should return true for manager', () => {
        const managerUser = { ...mockUser, role: 'manager' as const };
        expect(canManageLocations(managerUser)).toBe(true);
    });
    it('should return true for user with permission', () => {
        const userWithPerm = { ...mockUser, role: 'viewer' as const, permissions: { manage_locations: true } };
        expect(canManageLocations(userWithPerm)).toBe(true);
    });
  });

  describe('canViewAnalytics', () => {
    it('should return true for manager', () => {
        const managerUser = { ...mockUser, role: 'manager' as const };
        expect(canViewAnalytics(managerUser)).toBe(true);
    });
    it('should return true for user with permission', () => {
        const userWithPerm = { ...mockUser, role: 'viewer' as const, permissions: { view_analytics: true } };
        expect(canViewAnalytics(userWithPerm)).toBe(true);
    });
  });
});
