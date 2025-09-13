import type { User, UserRole } from '@/types/database';

export interface AuthUser extends User {
  supabaseUser: any; // SupabaseUser type
  tenant: any; // Tenant type
}

/**
 * Check if user has a specific role
 * @param user - The authenticated user
 * @param role - The role to check for
 * @returns boolean indicating if user has the role
 */
export const hasRole = (user: AuthUser | null, role: UserRole): boolean => {
  return user?.role === role;
};

/**
 * Check if user has a specific permission
 * @param user - The authenticated user
 * @param permission - The permission to check for
 * @returns boolean indicating if user has the permission
 */
export const hasPermission = (user: AuthUser | null, permission: string): boolean => {
  if (!user?.permissions) return false;
  return user.permissions[permission] === true;
};

/**
 * Check if user is an owner
 */
export const isOwner = (user: AuthUser | null): boolean => {
  return user?.role === 'owner';
};

/**
 * Check if user is an admin (includes owners)
 */
export const isAdmin = (user: AuthUser | null): boolean => {
  return user?.role === 'admin' || isOwner(user);
};

/**
 * Check if user is a manager (includes admins)
 */
export const isManager = (user: AuthUser | null): boolean => {
  return user?.role === 'manager' || isAdmin(user);
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (user: AuthUser | null): boolean => {
  return isAdmin(user) || hasPermission(user, 'manage_users');
};

/**
 * Check if user can manage locations
 */
export const canManageLocations = (user: AuthUser | null): boolean => {
  return isManager(user) || hasPermission(user, 'manage_locations');
};

/**
 * Check if user can view analytics
 */
export const canViewAnalytics = (user: AuthUser | null): boolean => {
  return isManager(user) || hasPermission(user, 'view_analytics');
};