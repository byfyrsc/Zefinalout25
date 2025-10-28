import React from 'react';
import ReactDOM from 'react-dom/client';
import CustomerGamificationDashboard from '../CustomerGamificationDashboard';
import CustomerEventsHub from '../../events/CustomerEventsHub';
import CustomerRewardsHub from '../CustomerRewardsHub';

// Simple test to verify components render without crashing
const testComponents = () => {
  // Create a simple container
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  try {
    // Test CustomerGamificationDashboard
    const root1 = ReactDOM.createRoot(container);
    root1.render(<CustomerGamificationDashboard />);
    console.log('CustomerGamificationDashboard rendered successfully');
    
    // Test CustomerEventsHub
    const root2 = ReactDOM.createRoot(container);
    root2.render(<CustomerEventsHub />);
    console.log('CustomerEventsHub rendered successfully');
    
    // Test CustomerRewardsHub
    const root3 = ReactDOM.createRoot(container);
    root3.render(<CustomerRewardsHub />);
    console.log('CustomerRewardsHub rendered successfully');
    
    console.log('All components rendered successfully!');
    return true;
  } catch (error) {
    console.error('Error rendering components:', error);
    return false;
  } finally {
    document.body.removeChild(container);
  }
};

// Run the test
testComponents();