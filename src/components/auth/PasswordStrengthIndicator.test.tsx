import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

// Mock Progress component
vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div 
      data-testid="password-progress" 
      data-value={value}
      data-class={className}
    />
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('PasswordStrengthIndicator', () => {
  it('should render with empty password', () => {
    render(<PasswordStrengthIndicator password="" />);
    
    expect(screen.getByText('Força da senha')).toBeInTheDocument();
    expect(screen.getByText('Digite uma senha')).toBeInTheDocument();
    expect(screen.getByTestId('password-progress')).toBeInTheDocument();
  });

  it('should show weak password strength', () => {
    render(<PasswordStrengthIndicator password="weak" />);
    
    expect(screen.getByText('Fraca')).toBeInTheDocument();
    expect(screen.getByTestId('password-progress')).toHaveAttribute('data-value', '20');
  });

  it('should show medium password strength', () => {
    render(<PasswordStrengthIndicator password="Medium1" />);
    
    expect(screen.getByText('Média')).toBeInTheDocument();
    expect(screen.getByTestId('password-progress')).toHaveAttribute('data-value', '60');
  });

  it('should show strong password strength', () => {
    render(<PasswordStrengthIndicator password="StrongPass1!" />);
    
    expect(screen.getByText('Forte')).toBeInTheDocument();
    expect(screen.getByTestId('password-progress')).toHaveAttribute('data-value', '100');
  });

  it('should show all requirements as fulfilled for strong password', () => {
    render(<PasswordStrengthIndicator password="StrongPass1!" />);
    
    const checkIcons = screen.getAllByTestId('check-icon');
    expect(checkIcons).toHaveLength(5);
    
    const xIcons = screen.queryAllByTestId('x-icon');
    expect(xIcons).toHaveLength(0);
  });

  it('should show requirements correctly for weak password', () => {
    render(<PasswordStrengthIndicator password="weakpass" />);
    
    // Should have 1 check (length) and 4 x icons
    const checkIcons = screen.getAllByTestId('check-icon');
    const xIcons = screen.getAllByTestId('x-icon');
    
    // Length requirement should be fulfilled
    expect(checkIcons).toHaveLength(1);
    expect(xIcons).toHaveLength(4);
  });

  it('should update requirements as password improves', () => {
    const { rerender } = render(<PasswordStrengthIndicator password="" />);
    
    // Empty password
    expect(screen.getByText('Digite uma senha')).toBeInTheDocument();
    
    // Weak password
    rerender(<PasswordStrengthIndicator password="weak" />);
    expect(screen.getByText('Fraca')).toBeInTheDocument();
    
    // Medium password
    rerender(<PasswordStrengthIndicator password="Medium1" />);
    expect(screen.getByText('Média')).toBeInTheDocument();
    
    // Strong password
    rerender(<PasswordStrengthIndicator password="StrongPass1!" />);
    expect(screen.getByText('Forte')).toBeInTheDocument();
  });
});