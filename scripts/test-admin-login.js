import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create client with anon key (same as frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Test login with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'byfyrsc@gmail.com',
      password: 'Carolteamo@20'
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    
    // Get user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        tenant:tenants(*)
      `)
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Error fetching user data:', userError.message);
      return;
    }
    
    console.log('\n📋 User Details:');
    console.log('Name:', userData.first_name, userData.last_name);
    console.log('Role:', userData.role);
    console.log('Active:', userData.is_active ? 'Yes' : 'No');
    console.log('Email Verified:', userData.email_verified ? 'Yes' : 'No');
    
    console.log('\n🏢 Tenant Details:');
    console.log('Tenant Name:', userData.tenant.name);
    console.log('Subdomain:', userData.tenant.subdomain);
    console.log('Plan:', userData.tenant.plan_id);
    
    console.log('\n🔐 Permissions:');
    Object.entries(userData.permissions || {}).forEach(([key, value]) => {
      console.log(`${key}: ${value ? '✅' : '❌'}`);
    });
    
    // Test access to admin-only data
    console.log('\n🧪 Testing admin access...');
    
    // Test access to all tenants (admin should see all)
    const { data: allTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, subdomain')
      .limit(5);
    
    if (tenantsError) {
      console.log('❌ Cannot access tenants data:', tenantsError.message);
    } else {
      console.log('✅ Can access tenants data:', allTenants.length, 'tenants found');
    }
    
    // Test access to users data
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Cannot access users data:', usersError.message);
    } else {
      console.log('✅ Can access users data:', allUsers.length, 'users found');
    }
    
    console.log('\n🎉 Admin user test completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Email: byfyrsc@gmail.com');
    console.log('Password: Carolteamo@20');
    console.log('\n🌐 You can now login at: http://localhost:8080/login');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAdminLogin();