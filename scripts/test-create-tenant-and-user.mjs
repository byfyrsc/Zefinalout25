import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envConfig = dotenv.parse(fs.readFileSync(process.cwd() + '/.env'));

// Get environment variables
const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase environment variables not found.');
  console.error('Make sure the .env file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to test creating a new tenant and user
async function testCreateTenantAndUser() {
  const randomString = Math.random().toString(36).substring(7);
  const email = `testuser_${randomString}@test.com`;
  const password = `Password123!`;
  const fullName = 'Test User';
  const tenantName = 'Test Tenant';
  const subdomain = `test-tenant-${randomString}`;

  console.log(`Attempting to create tenant and user for email: ${email}`);

  const { data, error } = await supabase.rpc('create_new_tenant_and_user', {
    tenant_name: tenantName,
    tenant_subdomain: subdomain,
    user_email: email,
    user_password: password,
    user_full_name: fullName,
  });

  if (error) {
    console.error('Failed to create tenant and user:', error.message);
  } else {
    console.log('Successfully created tenant and user!');
    console.log('Data:', data);
  }
}

// Run the test
testCreateTenantAndUser();
