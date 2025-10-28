import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ReactNode } from 'react';

// Mock server-only
vi.mock("server-only", () => ({}));

// Create mock functions
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockUserServiceGetById = vi.fn();
const mockTenantServiceGetById = vi.fn();

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser
    }
  }
}));

// Mock supabase-services
vi.mock('@/lib/supabase-services', () => ({
  userService: {
    getById: mockUserServiceGetById
  },
  tenantService: {
    getById: mockTenantServiceGetById
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock SessionService
vi.mock('@/services/sessionService', () => ({
  SessionService: {
    initSessionManagement: vi.fn(),
    cleanup: vi.fn(),
    resetSessionTimer: vi.fn()
  }
}));

// Mock SecurityService
vi.mock('@/services/securityService', () => ({
  SecurityService: {
    isAuthRateLimited: vi.fn().mockReturnValue(false),
    recordAuthAttempt: vi.fn(),
    validateEmail: vi.fn().mockReturnValue(true),
    validatePassword: vi.fn().mockReturnValue({ valid: true, errors: [] }),
    sanitizeInput: vi.fn().mockImplementation((input) => input),
    logSecurityEvent: vi.fn()
  }
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { loading, user } = useAuth();
  
  if (loading) {
    return <div data-testid="loading">Verificando autenticação...</div>;
  }
  
  return <div data-testid="loaded">{user ? 'Autenticado' : 'Não autenticado'}</div>;
};

const renderWithAuthProvider = (component: ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });
  
  it('should show loading state initially', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    renderWithAuthProvider(<TestComponent />);
    
    // Verificar se o estado de carregamento é exibido inicialmente
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
  });
  
  it('should handle authentication errors and not get stuck in loading state', async () => {
    // Configurar o mock para simular um erro durante a autenticação
    mockGetSession.mockRejectedValue(new Error('Authentication error'));
    
    renderWithAuthProvider(<TestComponent />);
    
    // Inicialmente deve mostrar o estado de carregamento
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Mesmo com erro, deve sair do estado de carregamento
    await waitFor(() => {
      expect(screen.getByTestId('loaded')).toBeInTheDocument();
      expect(screen.getByText('Não autenticado')).toBeInTheDocument();
    });
  });
  
  it('should transition from loading to not authenticated state', async () => {
    // Configurar o mock para retornar null para session
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    renderWithAuthProvider(<TestComponent />);
    
    // Inicialmente deve mostrar o estado de carregamento
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Depois deve mostrar o estado não autenticado
    await waitFor(() => {
      expect(screen.getByTestId('loaded')).toBeInTheDocument();
      expect(screen.getByText('Não autenticado')).toBeInTheDocument();
    });
  });
  
  it('should handle successful authentication', async () => {
    // Configurar o mock para retornar uma sessão válida
    const mockUser = { id: '123', email: 'test@example.com' };
    mockGetSession.mockResolvedValue({ 
      data: { 
        session: { 
          user: mockUser 
        } 
      } 
    });
    
    // Configurar mocks para userService e tenantService
    mockUserServiceGetById.mockResolvedValue({ 
      id: '123', 
      email: 'test@example.com',
      tenant_id: '456',
      role: 'admin'
    });
    
    mockTenantServiceGetById.mockResolvedValue({
      id: '456',
      name: 'Test Tenant'
    });
    
    renderWithAuthProvider(<TestComponent />);
    
    // Inicialmente deve mostrar o estado de carregamento
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Depois deve mostrar o estado autenticado
    await waitFor(() => {
      expect(screen.getByTestId('loaded')).toBeInTheDocument();
    });
    
    // Should show authenticated text
    expect(screen.getByText('Autenticado')).toBeInTheDocument();
  });
});