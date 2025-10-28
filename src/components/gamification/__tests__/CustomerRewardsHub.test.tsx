import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomerRewardsHub from '../CustomerRewardsHub';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Gift: () => <div data-testid="gift-icon" />,
  Coins: () => <div data-testid="coins-icon" />,
  Ticket: () => <div data-testid="ticket-icon" />,
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe('CustomerRewardsHub', () => {
  it('renders without crashing', () => {
    render(<CustomerRewardsHub />);
    
    // Check if the main title is rendered
    expect(screen.getByText('Meus Pontos e Recompensas')).toBeInTheDocument();
    
    // Check if the main components are rendered
    expect(screen.getByText('2.850')).toBeInTheDocument(); // Points
    expect(screen.getByText('10% de Desconto')).toBeInTheDocument();
    expect(screen.getByText('Bebida Grátis')).toBeInTheDocument();
  });

  it('displays the correct number of rewards', () => {
    render(<CustomerRewardsHub />);
    
    // Check if reward stats are displayed
    expect(screen.getByText('3')).toBeInTheDocument(); // Available rewards
    expect(screen.getByText('2')).toBeInTheDocument(); // Claimed rewards
    expect(screen.getByText('2')).toBeInTheDocument(); // Redemption history
  });

  it('shows reward types correctly', () => {
    render(<CustomerRewardsHub />);
    
    // Check if reward types are displayed
    expect(screen.getByText('Desconto')).toBeInTheDocument();
    expect(screen.getByText('Brinde')).toBeInTheDocument();
    expect(screen.getByText('Exclusivo')).toBeInTheDocument();
  });
});