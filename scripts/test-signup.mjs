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

// Function to test signup
async function testSignUp(email, password, firstName, lastName, tenantName, subdomain) {
  console.log(`Attempting to sign up with email: ${email}`);
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        tenant_name: tenantName,
        subdomain: subdomain,
      }
    }
  });

  if (error) {
    console.error('Signup failed:', error.message);
  } else {
    console.log('Signup successful!');
    console.log('User:', data.user);
  }
  console.log('---');
}

// Run tests
async function runTests() {
  console.log('--- Starting Signup Tests ---');

  const randomString = Math.random().toString(36).substring(7);
  const email = `testuser_${randomString}@test.com`;
  const password = `Password123!`;
  const firstName = 'Test';
  const lastName = 'User';
  const tenantName = 'Test Tenant';
  const subdomain = `test-tenant-${randomString}`;

  await testSignUp(email, password, firstName, lastName, tenantName, subdomain);

  console.log('--- Signup Tests Finished ---');
}

runTests();
