import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { userService, tenantService } from '@/lib/supabase-services';
import type { User, Tenant, UserRole } from '@/types/database';
import { toast } from 'sonner';
import { hasRole as checkHasRole, hasPermission as checkHasPermission, isOwner as checkIsOwner, isAdmin as checkIsAdmin, isManager as checkIsManager, canManageUsers as checkCanManageUsers, canManageLocations as checkCanManageLocations, canViewAnalytics as checkCanViewAnalytics } from '@/lib/authHelpers';
import { SecurityService } from '@/services/securityService';
import { SessionService } from '@/services/sessionService';
import Logger from '@/utils/logger';
import { AppError, AuthenticationError, ValidationError, RateLimitError } from '@/utils/errorHandler';

interface AuthUser extends User {
  supabaseUser: SupabaseUser;
  tenant: Tenant;
}

interface AuthContextType {
  // Auth State
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  useMockAuth: boolean; // Adicionado para expor o estado de mock
  
  // Auth Methods
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    tenantName?: string;
    subdomain?: string;
  }) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updatePassword: (password: string) => Promise<{ error?: AuthError }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error?: Error }>;
  
  // Role & Permission Helpers
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManageUsers: boolean;
  canManageLocations: boolean;
  canViewAnalytics: boolean;
  
  // Security Methods
  isRateLimited: () => boolean;
  
  // Session Methods
  extendSession: () => Promise<boolean>;
  isSessionExpiringSoon: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user for development
const MOCK_USER: AuthUser = {
  id: 'mock-user-id-123',
  tenant_id: 'mock-tenant-id-456',
  email: 'admin@digaze.com',
  role: 'owner', 
  permissions: {
    manage_users: true,
    manage_locations: true,
    manage_campaigns: true,
    manage_events: true,
    view_analytics: true,
    manage_billing: true,
    manage_api_keys: true,
    manage_integrations: true,
  },
  profile_data: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login_at: new Date().toISOString(),
  first_name: 'Mock',
  last_name: 'Admin',
  phone: '123-456-7890',
  avatar_url: null,
  preferences: {},
  is_active: true,
  email_verified: true,
  supabaseUser: {
    id: 'mock-user-id-123',
    email: 'admin@digaze.com',
    app_metadata: { provider: 'email' },
    user_metadata: {
      first_name: 'Mock',
      last_name: 'Admin',
      tenant_id: 'mock-tenant-id-456',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  tenant: {
    id: 'mock-tenant-id-456',
    name: 'Mock Restaurant Group',
    subdomain: 'mockgroup',
    settings: {},
    plan_id: 'enterprise_plus',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stripe_customer_id: null,
    trial_ends_at: null,
    branding: {},
    monthly_feedback_limit: 99999,
    location_limit: 999,
  },
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [useMockAuth, setUseMockAuth] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Check for mock auth setting from localStorage
  useEffect(() => {
    const storedMockAuth = localStorage.getItem('useMockAuth') === 'true';
    setUseMockAuth(storedMockAuth);
  }, []);

  // Get client IP for rate limiting
  const getClientIP = async (): Promise<string> => {
    // In a real implementation, you would get the actual client IP
    // For now, we'll use a placeholder
    return '127.0.0.1';
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Generate a correlation ID for this session
    const correlationId = Logger.getCorrelationId() || 'auth-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    Logger.setCorrelationId(correlationId);

    if (useMockAuth) {
      setUser(MOCK_USER);
      setSession({ user: MOCK_USER.supabaseUser } as Session); // Mock session
      setLoading(false);
      Logger.info('Mock authentication initialized', { correlationId, userId: MOCK_USER.id });
      return; // Skip real Supabase auth
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        Logger.info('Initializing authentication session', { correlationId });
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            Logger.info('User session found, loading user data', { 
              correlationId, 
              userId: initialSession.user.id 
            });
            await loadUserData(initialSession.user);
          } else {
            Logger.info('No user session found', { correlationId });
            setLoading(false);
          }
        }
      } catch (error) {
        Logger.error('Error getting initial session', { error, correlationId });
        toast.error('Erro ao verificar autenticação. Por favor, tente novamente.');
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || useMockAuth) return; // Skip if mock auth is active
        
        try {
          Logger.info('Auth state changed', { event, correlationId });
          setSession(session);
          
          if (event === 'SIGNED_IN' && session?.user) {
            Logger.info('User signed in, loading user data', { 
              correlationId, 
              userId: session.user.id,
              email: session.user.email
            });
            await loadUserData(session.user);
            // Initialize session management when user signs in
            SessionService.initSessionManagement();
          } else if (event === 'SIGNED_OUT') {
            Logger.info('User signed out', { correlationId });
            setUser(null);
            setLoading(false);
            // Clean up session management when user signs out
            SessionService.cleanup();
          } else if (event === 'TOKEN_REFRESHED') {
            Logger.info('User token refreshed', { correlationId });
            // Reset session timer when token is refreshed
            SessionService.resetSessionTimer();
          } else {
            setLoading(false);
          }
        } catch (error) {
          Logger.error('Error in auth state change handler', { error, event, correlationId });
          toast.error('Erro ao processar mudança de autenticação. Por favor, recarregue a página.');
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      // Clean up session management when component unmounts
      SessionService.cleanup();
      Logger.clearCorrelationId();
    };
  }, [useMockAuth]); // Re-run effect if mock auth setting changes

  // Load user data from database
  const loadUserData = async (supabaseUser: SupabaseUser) => {
    const correlationId = Logger.getCorrelationId();
    try {
      Logger.info('Loading user data from database', { 
        correlationId, 
        userId: supabaseUser.id,
        email: supabaseUser.email
      });
      
      const userData = await userService.getById(supabaseUser.id);
      
      if (userData) {
        // Check if account is locked
        if (!userData.is_active) {
          Logger.warn('Account is locked', { userId: userData.id, correlationId });
          toast.error('Conta bloqueada. Por favor, entre em contato com o suporte.');
          await signOut();
          return;
        }
        
        const tenantData = await tenantService.getById(userData.tenant_id);
        
        if (tenantData) {
          setUser({
            ...userData,
            supabaseUser,
            tenant: tenantData
          });
          
          // Update last login time
          await userService.update(userData.id, {
            last_login_at: new Date().toISOString()
          });
          
          Logger.info('User data loaded successfully', { 
            correlationId, 
            userId: userData.id,
            tenantId: userData.tenant_id
          });
        } else {
          const error = new AppError(`Tenant not found for user: ${userData.tenant_id}`, 404);
          Logger.error('Tenant not found for user', { error, tenantId: userData.tenant_id, correlationId });
          toast.error('Erro ao carregar dados da empresa. Por favor, entre em contato com o suporte.');
          setUser(null);
        }
      } else {
        const error = new AppError(`User data not found in database for user: ${supabaseUser.id}`, 404);
        Logger.error('User data not found in database', { error, userId: supabaseUser.id, correlationId });
        toast.error('Dados do usuário não encontrados. Por favor, entre em contato com o suporte.');
        setUser(null);
      }
    } catch (error) {
      Logger.error('Error loading user data', { error, correlationId });
      toast.error('Erro ao carregar dados do usuário. Por favor, tente novamente.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Auth methods (mocked if useMockAuth is true)
  const signIn = async (email: string, password: string) => {
    const correlationId = Logger.getCorrelationId() || 'signin-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    Logger.setCorrelationId(correlationId);
    
    if (useMockAuth) {
      setUser(MOCK_USER);
      setSession({ user: MOCK_USER.supabaseUser } as Session);
      setLoading(false);
      Logger.info('Mock sign in successful', { correlationId, email });
      toast.success('Login mockado realizado com sucesso!');
      return {};
    }
    
    try {
      Logger.info('Attempting user sign in', { correlationId, email });
      setLoading(true);
      
      // Get client IP for rate limiting
      const clientIP = await getClientIP();
      
      // Determine user role for rate limiting (anonymous for login attempts)
      const userRole: UserRole | 'anonymous' = 'anonymous';
      
      // Check rate limiting
      if (await SecurityService.isAuthRateLimited(clientIP, userRole)) {
        setIsRateLimited(true);
        const error = new RateLimitError('Too many login attempts');
        Logger.warn('Rate limit exceeded for login', { error, clientIP, email, correlationId });
        toast.error('Muitas tentativas de login. Por favor, aguarde antes de tentar novamente.');
        SecurityService.logSecurityEvent('RATE_LIMIT_EXCEEDED', null, clientIP, {
          action: 'login',
          email: SecurityService.sanitizeInput(email)
        });
        return { error: error as unknown as AuthError };
      }
      
      // Record auth attempt
      await SecurityService.recordAuthAttempt(clientIP, userRole);
      
      // Validate inputs
      if (!SecurityService.validateEmail(email)) {
        const error = new ValidationError('Invalid email format');
        Logger.warn('Invalid email format for login', { error, email, correlationId });
        toast.error('Formato de email inválido.');
        return { error: error as unknown as AuthError };
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        const authError = new AuthenticationError(error.message);
        Logger.error('Failed login attempt', { error: authError, email, correlationId });
        toast.error(`Erro ao fazer login: ${error.message}`);
        SecurityService.logSecurityEvent('FAILED_LOGIN', null, clientIP, {
          email: SecurityService.sanitizeInput(email),
          error: error.message
        });
      } else {
        Logger.info('Successful login', { email, correlationId });
        toast.success('Login realizado com sucesso!');
        SecurityService.logSecurityEvent('SUCCESSFUL_LOGIN', null, clientIP, {
          email: SecurityService.sanitizeInput(email)
        });
      }
      
      return { error };
    } catch (error) {
      Logger.error('Unexpected error during login', { error, correlationId });
      toast.error('Erro inesperado ao fazer login. Por favor, tente novamente.');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      firstName: string;
      lastName: string;
      tenantName?: string;
      subdomain?: string;
    }
  ) => {
    const correlationId = Logger.getCorrelationId() || 'signup-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    Logger.setCorrelationId(correlationId);
    
    if (useMockAuth) {
      Logger.info('Mock sign up initiated', { correlationId, email });
      toast.info('Cadastro mockado. Recarregue a página para usar o usuário mock.');
      return {};
    }
    
    try {
      Logger.info('Attempting user sign up', { 
        correlationId, 
        email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      setLoading(true);
      
      // Get client IP for rate limiting
      const clientIP = await getClientIP();
      
      // Determine user role for rate limiting (anonymous for signup attempts)
      const userRole: UserRole | 'anonymous' = 'anonymous';
      
      // Check rate limiting
      if (await SecurityService.isAuthRateLimited(clientIP, userRole)) {
        setIsRateLimited(true);
        const error = new RateLimitError('Too many signup attempts');
        Logger.warn('Rate limit exceeded for signup', { error, clientIP, email, correlationId });
        toast.error('Muitas tentativas de cadastro. Por favor, aguarde antes de tentar novamente.');
        SecurityService.logSecurityEvent('RATE_LIMIT_EXCEEDED', null, clientIP, {
          action: 'signup',
          email: SecurityService.sanitizeInput(email)
        });
        return { error: error as unknown as AuthError };
      }
      
      // Record auth attempt
      await SecurityService.recordAuthAttempt(clientIP, userRole);
      
      // Validate inputs
      if (!SecurityService.validateEmail(email)) {
        const error = new ValidationError('Invalid email format');
        Logger.warn('Invalid email format for signup', { error, email, correlationId });
        toast.error('Formato de email inválido.');
        return { error: error as unknown as AuthError };
      }
      
      // Validate password strength
      const passwordValidation = SecurityService.validatePassword(password);
      if (!passwordValidation.valid) {
        const error = new ValidationError(passwordValidation.errors[0]);
        Logger.warn('Password does not meet requirements', { error, email, correlationId });
        toast.error(passwordValidation.errors[0]);
        return { error: error as unknown as AuthError };
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            tenant_name: userData.tenantName,
            subdomain: userData.subdomain
          }
        }
      });
      
      if (error) {
        const authError = new AuthenticationError(error.message);
        Logger.error('Failed signup attempt', { error: authError, email, correlationId });
        toast.error(`Erro ao criar conta: ${error.message}`);
        SecurityService.logSecurityEvent('FAILED_SIGNUP', null, clientIP, {
          email: SecurityService.sanitizeInput(email),
          error: error.message
        });
      } else {
        Logger.info('Successful signup', { email, correlationId });
        toast.success('Conta criada! Verifique seu email para confirmar.');
        SecurityService.logSecurityEvent('SUCCESSFUL_SIGNUP', null, clientIP, {
          email: SecurityService.sanitizeInput(email)
        });
      }
      
      return { error };
    } catch (error) {
      Logger.error('Unexpected error during signup', { error, correlationId });
      toast.error('Erro inesperado ao criar conta. Por favor, tente novamente.');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const correlationId = Logger.getCorrelationId();
    if (useMockAuth) {
      setUser(null);
      setSession(null);
      setLoading(false);
      Logger.info('Mock sign out successful', { correlationId });
      toast.success('Logout mockado realizado com sucesso!');
      return;
    }
    try {
      Logger.info('Attempting user sign out', { correlationId });
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        const authError = new AuthenticationError(error.message);
        Logger.error('Failed to sign out', { error: authError, correlationId });
        toast.error(`Erro ao fazer logout: ${error.message}`);
      } else {
        Logger.info('Successful sign out', { correlationId });
        toast.success('Logout realizado com sucesso!');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      Logger.error('Unexpected error during sign out', { error, correlationId });
      toast.error('Erro inesperado ao fazer logout. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const correlationId = Logger.getCorrelationId() || 'reset-password-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    Logger.setCorrelationId(correlationId);
    
    if (useMockAuth) {
      Logger.info('Mock password reset initiated', { correlationId, email });
      toast.info('Redefinição de senha mockada. Verifique o console.');
      console.log(`Mock: Password reset email sent to ${email}`);
      return {};
    }
    try {
      Logger.info('Attempting password reset', { correlationId, email });
      // Get client IP for rate limiting
      const clientIP = await getClientIP();
      
      // Determine user role for rate limiting (anonymous for password reset attempts)
      const userRole: UserRole | 'anonymous' = 'anonymous';
      
      // Check rate limiting
      if (await SecurityService.isAuthRateLimited(clientIP, userRole)) {
        setIsRateLimited(true);
        const error = new RateLimitError('Too many password reset attempts');
        Logger.warn('Rate limit exceeded for password reset', { error, clientIP, email, correlationId });
        toast.error('Muitas tentativas de redefinição de senha. Por favor, aguarde antes de tentar novamente.');
        SecurityService.logSecurityEvent('RATE_LIMIT_EXCEEDED', null, clientIP, {
          action: 'password_reset',
          email: SecurityService.sanitizeInput(email)
        });
        return { error: error as unknown as AuthError };
      }
      
      // Record auth attempt
      await SecurityService.recordAuthAttempt(clientIP, userRole);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        const authError = new AuthenticationError(error.message);
        Logger.error('Failed password reset request', { error: authError, email, correlationId });
        toast.error(`Erro ao enviar email de recuperação: ${error.message}`);
        SecurityService.logSecurityEvent('FAILED_PASSWORD_RESET', null, clientIP, {
          email: SecurityService.sanitizeInput(email),
          error: error.message
        });
      } else {
        Logger.info('Successful password reset request', { email, correlationId });
        toast.success('Email de recuperação enviado!');
        SecurityService.logSecurityEvent('SUCCESSFUL_PASSWORD_RESET', null, clientIP, {
          email: SecurityService.sanitizeInput(email)
        });
      }
      
      return { error };
    } catch (error) {
      Logger.error('Unexpected error during password reset', { error, correlationId });
      toast.error('Erro inesperado ao enviar email de recuperação. Por favor, tente novamente.');
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    const correlationId = Logger.getCorrelationId();
    if (useMockAuth) {
      Logger.info('Mock password update successful', { correlationId });
      toast.success('Senha mockada atualizada com sucesso!');
      return {};
    }
    
    try {
      Logger.info('Attempting password update', { correlationId });
      // Validate password strength
      const passwordValidation = SecurityService.validatePassword(password);
      if (!passwordValidation.valid) {
        const error = new ValidationError(passwordValidation.errors[0]);
        Logger.warn('Password does not meet requirements for update', { error, correlationId });
        toast.error(passwordValidation.errors[0]);
        return { error: error as unknown as AuthError };
      }
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        const authError = new AuthenticationError(error.message);
        Logger.error('Failed to update password', { error: authError, correlationId });
        toast.error(`Erro ao atualizar senha: ${error.message}`);
      } else {
        Logger.info('Successful password update', { correlationId });
        toast.success('Senha atualizada com sucesso!');
        
        // Log the password update
        const clientIP = await getClientIP();
        SecurityService.logSecurityEvent('PASSWORD_UPDATED', user?.id || null, clientIP, {});
      }
      
      return { error };
    } catch (error) {
      Logger.error('Unexpected error during password update', { error, correlationId });
      toast.error('Erro inesperado ao atualizar senha. Por favor, tente novamente.');
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    const correlationId = Logger.getCorrelationId();
    if (useMockAuth) {
      setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
      Logger.info('Mock profile update successful', { correlationId, updates });
      toast.success('Perfil mockado atualizado com sucesso!');
      return {};
    }
    try {
      if (!user) {
        const error = new AuthenticationError('User not authenticated');
        Logger.warn('Attempt to update profile without authentication', { error, correlationId });
        throw error;
      }
      
      Logger.info('Attempting profile update', { 
        correlationId, 
        userId: user.id,
        updates: Object.keys(updates)
      });
      
      // Sanitize inputs
      const sanitizedUpdates = {
        ...updates,
        first_name: updates.first_name ? SecurityService.sanitizeInput(updates.first_name) : undefined,
        last_name: updates.last_name ? SecurityService.sanitizeInput(updates.last_name) : undefined,
        phone: updates.phone ? SecurityService.sanitizeInput(updates.phone) : undefined
      };
      
      const updatedUser = await userService.update(user.id, sanitizedUpdates);
      
      if (updatedUser) {
        setUser({
          ...user,
          ...updatedUser
        });
        Logger.info('Successful profile update', { 
          correlationId, 
          userId: user.id,
          updatedFields: Object.keys(updates)
        });
        toast.success('Perfil atualizado com sucesso!');
        
        // Log the profile update
        const clientIP = await getClientIP();
        SecurityService.logSecurityEvent('PROFILE_UPDATED', user.id, clientIP, {
          updatedFields: Object.keys(updates)
        });
      }
      
      return {};
    } catch (error) {
      Logger.error('Error updating profile', { error, correlationId });
      toast.error(`Erro ao atualizar perfil: ${(error as Error).message}`);
      return { error: error as Error };
    }
  };

  // Session management methods
  const extendSession = async (): Promise<boolean> => {
    return await SessionService.extendSession();
  };

  const isSessionExpiringSoon = async (): Promise<boolean> => {
    return await SessionService.isSessionExpiringSoon();
  };

  // Role and permission helpers
  const isOwnerUser = checkIsOwner(user);
  const isAdminUser = checkIsAdmin(user);
  const isManagerUser = checkIsManager(user);
  
  const canManageUsersUser = checkCanManageUsers(user);
  const canManageLocationsUser = checkCanManageLocations(user);
  const canViewAnalyticsUser = checkCanViewAnalytics(user);

  const value: AuthContextType = {
    // Auth State
    user,
    session,
    loading,
    useMockAuth,
    
    // Auth Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    
    // Role & Permission Helpers
    hasRole: (role: UserRole) => checkHasRole(user, role),
    hasPermission: (permission: string) => checkHasPermission(user, permission),
    isOwner: isOwnerUser,
    isAdmin: isAdminUser,
    isManager: isManagerUser,
    canManageUsers: canManageUsersUser,
    canManageLocations: canManageLocationsUser,
    canViewAnalytics: canViewAnalyticsUser,
    
    // Security Methods
    isRateLimited: () => isRateLimited,
    
    // Session Methods
    extendSession,
    isSessionExpiringSoon
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};