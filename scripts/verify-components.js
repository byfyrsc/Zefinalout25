// Simple script to verify that our new components can be imported without errors
console.log('Verifying gamification components...');

try {
  // Try to import the customer components
  const CustomerGamificationDashboard = require('../src/components/gamification/CustomerGamificationDashboard.tsx');
  console.log('✅ CustomerGamificationDashboard imported successfully');
  
  const CustomerEventsHub = require('../src/components/events/CustomerEventsHub.tsx');
  console.log('✅ CustomerEventsHub imported successfully');
  
  const CustomerRewardsHub = require('../src/components/gamification/CustomerRewardsHub.tsx');
  console.log('✅ CustomerRewardsHub imported successfully');
  
  // Try to import the customer pages
  const CustomerGamificationPage = require('../src/pages/CustomerGamificationPage.tsx');
  console.log('✅ CustomerGamificationPage imported successfully');
  
  const CustomerEventsPage = require('../src/pages/CustomerEventsPage.tsx');
  console.log('✅ CustomerEventsPage imported successfully');
  
  const CustomerRewardsPage = require('../src/pages/CustomerRewardsPage.tsx');
  console.log('✅ CustomerRewardsPage imported successfully');
  
  // Try to import the service
  const customerGamificationService = require('../src/services/customerGamificationService.ts');
  console.log('✅ CustomerGamificationService imported successfully');
  
  console.log('\n🎉 All components imported successfully!');
  console.log('\nYou can now test the gamification features in the browser at:');
  console.log('- http://localhost:4173/customer/gamification');
  console.log('- http://localhost:4173/customer/events');
  console.log('- http://localhost:4173/customer/rewards');
} catch (error) {
  console.error('❌ Error importing components:', error.message);
}