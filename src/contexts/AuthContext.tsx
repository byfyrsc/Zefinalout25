import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { userService, tenantService } from '@/lib/supabase-services';
import type { User, Tenant, UserRole } from '@/types/database';
import { toast } from 'sonner';
import { hasRole as checkHasRole, hasPermission as checkHasPermission, isOwner as checkIsOwner, isAdmin as checkIsAdmin, isManager as checkIsManager, canManageUsers as checkCanManageUsers, canManageLocations as checkCanManageLocations, canViewAnalytics as checkCanViewAnalytics } from '@/lib/authHelpers';

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

  // Check for mock auth setting from localStorage
  useEffect(() => {
    const storedMockAuth = localStorage.getItem('useMockAuth') === 'true';
    setUseMockAuth(storedMockAuth);
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    if (useMockAuth) {
      setUser(MOCK_USER);
      setSession({ user: MOCK_USER.supabaseUser } as Session); // Mock session
      setLoading(false);
      return; // Skip real Supabase auth
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            await loadUserData(initialSession.user);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast.error('Erro ao verificar autenticação');
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
          setSession(session);
          
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserData(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setLoading(false);
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          toast.error('Erro ao processar mudança de autenticação');
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [useMockAuth]); // Re-run effect if mock auth setting changes

  // Load user data from database
  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const userData = await userService.getById(supabaseUser.id);
      
      if (userData) {
        const tenantData = await tenantService.getById(userData.tenant_id);
        
        if (tenantData) {
          setUser({
            ...userData,
            supabaseUser,
            tenant: tenantData
          });
        } else {
          console.error('Tenant not found for user:', userData.tenant_id);
          toast.error('Erro ao carregar dados da empresa');
          setUser(null);
        }
      } else {
        console.error('User data not found in database for user:', supabaseUser.id);
        toast.error('Dados do usuário não encontrados');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Erro ao carregar dados do usuário');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Auth methods (mocked if useMockAuth is true)
  const signIn = async (email: string, password: string) => {
    if (useMockAuth) {
      setUser(MOCK_USER);
      setSession({ user: MOCK_USER.supabaseUser } as Session);
      setLoading(false);
      toast.success('Login mockado realizado com sucesso!');
      return {};
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
      } else {
        toast.success('Login realizado com sucesso!');
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast.error('Erro inesperado ao fazer login');
      return { error: authError };
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
    if (useMockAuth) {
      toast.info('Cadastro mockado. Recarregue a página para usar o usuário mock.');
      return {};
    }
    try {
      setLoading(true);
      
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
        toast.error('Erro ao criar conta: ' + error.message);
      } else {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast.error('Erro inesperado ao criar conta');
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (useMockAuth) {
      setUser(null);
      setSession(null);
      setLoading(false);
      toast.success('Logout mockado realizado com sucesso!');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Erro ao fazer logout: ' + error.message);
      } else {
        toast.success('Logout realizado com sucesso!');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro inesperado ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (useMockAuth) {
      toast.info('Redefinição de senha mockada. Verifique o console.');
      console.log(`Mock: Password reset email sent to ${email}`);
      return {};
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        toast.error('Erro ao enviar email de recuperação: ' + error.message);
      } else {
        toast.success('Email de recuperação enviado!');
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast.error('Erro inesperado ao enviar email de recuperação');
      return { error: authError };
    }
  };

  const updatePassword = async (password: string) => {
    if (useMockAuth) {
      toast.success('Senha mockada atualizada com sucesso!');
      return {};
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error('Erro ao atualizar senha: ' + error.message);
      } else {
        toast.success('Senha atualizada com sucesso!');
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      toast.error('Erro inesperado ao atualizar senha');
      return { error: authError };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (useMockAuth) {
      setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
      toast.success('Perfil mockado atualizado com sucesso!');
      return {};
    }
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const updatedUser = await userService.update(user.id, updates);
      
      if (updatedUser) {
        setUser({
          ...user,
          ...updatedUser
        });
        toast.success('Perfil atualizado com sucesso!');
      }
      
      return {};
    } catch (error) {
      const err = error as Error;
      toast.error('Erro ao atualizar perfil: ' + err.message);
      return { error: err };
    }
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
    canViewAnalytics: canViewAnalyticsUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};