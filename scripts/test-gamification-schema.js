// Simple script to test if our gamification tables exist in the database
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test function to check if our tables exist
async function testGamificationSchema() {
  console.log('Testing gamification schema...');
  
  try {
    // Test if gamification_profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('gamification_profiles')
      .select('id')
      .limit(1);
    
    if (profilesError && profilesError.code !== '42P01') {
      console.log('✅ gamification_profiles table exists');
    } else if (profilesError) {
      console.log('❌ gamification_profiles table does not exist');
    } else {
      console.log('✅ gamification_profiles table exists');
    }
    
    // Test if rewards table exists
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('id')
      .limit(1);
    
    if (rewardsError && rewardsError.code !== '42P01') {
      console.log('✅ rewards table exists');
    } else if (rewardsError) {
      console.log('❌ rewards table does not exist');
    } else {
      console.log('✅ rewards table exists');
    }
    
    // Test if reward_redemptions table exists
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('reward_redemptions')
      .select('id')
      .limit(1);
    
    if (redemptionsError && redemptionsError.code !== '42P01') {
      console.log('✅ reward_redemptions table exists');
    } else if (redemptionsError) {
      console.log('❌ reward_redemptions table does not exist');
    } else {
      console.log('✅ reward_redemptions table exists');
    }
    
    // Test if gamification_points table exists
    const { data: points, error: pointsError } = await supabase
      .from('gamification_points')
      .select('id')
      .limit(1);
    
    if (pointsError && pointsError.code !== '42P01') {
      console.log('✅ gamification_points table exists');
    } else if (pointsError) {
      console.log('❌ gamification_points table does not exist');
    } else {
      console.log('✅ gamification_points table exists');
    }
    
    console.log('Schema test completed!');
  } catch (error) {
    console.error('Error testing schema:', error.message);
  }
}

// Run the test
testGamificationSchema();