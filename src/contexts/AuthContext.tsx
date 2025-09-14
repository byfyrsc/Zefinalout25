import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { userService, tenantService } from '@/lib/supabase-services';
import type { User, Tenant, UserRole } from '@/types/database';
import { toast } from 'sonner';
import { env } from '@/lib/env';
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            await loadUserData(initialSession.user);
          } else {
            // Se não houver sessão inicial, definir loading como false
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
        if (!mounted) return;
        
        try {
          setSession(session);
          
          if (event === 'SIGNED_IN' && session?.user) {
            await loadUserData(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setLoading(false);
          } else {
            // Para outros eventos, garantir que loading seja false
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
  }, []);

  // Load user data from database
  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const userData = await userService.getById(supabaseUser.id);
      
      if (userData) {
        // Get tenant data
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
      // Sempre definir loading como false, independentemente do resultado
      setLoading(false);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
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

  // Sign up
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

  // Sign out
  const signOut = async () => {
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

  // Reset password
  const resetPassword = async (email: string) => {
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

  // Update password
  const updatePassword = async (password: string) => {
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

  // Update profile
  const updateProfile = async (updates: Partial<User>) => {
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