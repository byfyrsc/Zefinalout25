import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ReactNode } from 'react';

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn()
    }
  }
}));

// Mock supabase-services
vi.mock('@/lib/supabase-services', () => ({
  userService: {
    getById: vi.fn(),
    update: vi.fn()
  },
  tenantService: {
    getById: vi.fn()
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
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
  });
  
  it('should show loading state initially', async () => {
    renderWithAuthProvider(<TestComponent />);
    
    // Verificar se o estado de carregamento é exibido inicialmente
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
  });
  
  it('should handle authentication errors and not get stuck in loading state', async () => {
    // Configurar o mock para simular um erro durante a autenticação
    const { supabase } = await import('@/lib/supabase');
    supabase.auth.getSession.mockRejectedValue(new Error('Authentication error'));
    
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
    const { supabase } = await import('@/lib/supabase');
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    
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
    const { supabase } = await import('@/lib/supabase');
    const mockUser = { id: '123', email: 'test@example.com' };
    supabase.auth.getSession.mockResolvedValue({ 
      data: { 
        session: { 
          user: mockUser 
        } 
      } 
    });
    
    // Configurar mocks para userService e tenantService
    const { userService, tenantService } = await import('@/lib/supabase-services');
    userService.getById.mockResolvedValue({ 
      id: '123', 
      email: 'test@example.com',
      tenant_id: '456',
      role: 'admin'
    });
    
    tenantService.getById.mockResolvedValue({
      id: '456',
      name: 'Test Tenant'
    });
    
    renderWithAuthProvider(<TestComponent />);
    
    // Inicialmente deve mostrar o estado de carregamento
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Depois deve mostrar o estado autenticado
    await waitFor(() => {
      expect(screen.getByTestId('loaded')).toBeInTheDocument();
      expect(screen.getByText('Autenticado')).toBeInTheDocument();
    });
  });
});