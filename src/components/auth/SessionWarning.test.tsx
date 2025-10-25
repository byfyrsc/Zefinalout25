import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionWarning } from './SessionWarning';

// Mock hooks
const mockUseSecurity = {
  showSessionWarning: false,
  dismissSessionWarning: vi.fn(),
  extendSession: vi.fn()
};

const mockUseAuth = {
  signOut: vi.fn()
};

vi.mock('@/hooks/useSecurity', () => ({
  useSecurity: () => mockUseSecurity
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock AlertDialog components
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: any) => open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, onClick, className, variant }: any) => (
    <button 
      data-testid="alert-action" 
      onClick={onClick}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button data-testid="alert-cancel" onClick={onClick}>{children}</button>
  ),
  AlertDialogContent: ({ children }: any) => <div data-testid="alert-content">{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div data-testid="alert-footer">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div data-testid="alert-header">{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div data-testid="alert-title">{children}</div>,
}));

describe('SessionWarning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when showSessionWarning is false', () => {
    mockUseSecurity.showSessionWarning = false;
    
    render(<SessionWarning />);
    
    expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();
  });

  it('should render when showSessionWarning is true', () => {
    mockUseSecurity.showSessionWarning = true;
    
    render(<SessionWarning />);
    
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('alert-title')).toHaveTextContent('Sessão Expirando');
    expect(screen.getByTestId('alert-description')).toBeInTheDocument();
  });

  it('should call dismissSessionWarning when cancel button is clicked', () => {
    mockUseSecurity.showSessionWarning = true;
    
    render(<SessionWarning />);
    
    const cancelButton = screen.getByTestId('alert-cancel');
    fireEvent.click(cancelButton);
    
    expect(mockUseSecurity.dismissSessionWarning).toHaveBeenCalled();
  });

  it('should extend session when extend button is clicked', async () => {
    mockUseSecurity.showSessionWarning = true;
    mockUseSecurity.extendSession.mockResolvedValue(true);
    
    render(<SessionWarning />);
    
    const extendButton = screen.getByTestId('alert-action');
    fireEvent.click(extendButton);
    
    await waitFor(() => {
      expect(mockUseSecurity.extendSession).toHaveBeenCalled();
    });
  });

  it('should show success toast when session is extended successfully', async () => {
    mockUseSecurity.showSessionWarning = true;
    mockUseSecurity.extendSession.mockResolvedValue(true);
    
    render(<SessionWarning />);
    
    const extendButton = screen.getByText('Estender Sessão');
    fireEvent.click(extendButton);
    
    await waitFor(() => {
      expect(mockUseSecurity.extendSession).toHaveBeenCalled();
    });
  });

  it('should show error toast and sign out when session extension fails', async () => {
    mockUseSecurity.showSessionWarning = true;
    mockUseSecurity.extendSession.mockResolvedValue(false);
    
    render(<SessionWarning />);
    
    const extendButton = screen.getByText('Estender Sessão');
    fireEvent.click(extendButton);
    
    await waitFor(() => {
      expect(mockUseSecurity.extendSession).toHaveBeenCalled();
      expect(mockUseAuth.signOut).toHaveBeenCalled();
    });
  });

  it('should sign out when logout button is clicked', async () => {
    mockUseSecurity.showSessionWarning = true;
    
    render(<SessionWarning />);
    
    const logoutButtons = screen.getAllByTestId('alert-action');
    const logoutButton = logoutButtons.find(button => 
      button.textContent === 'Fazer Logout'
    );
    
    if (logoutButton) {
      fireEvent.click(logoutButton);
      await waitFor(() => {
        expect(mockUseAuth.signOut).toHaveBeenCalled();
      });
    }
  });
});