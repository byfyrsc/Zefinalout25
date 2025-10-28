import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envConfig = dotenv.parse(fs.readFileSync(process.cwd() + '/.env'));

// Get environment variables
const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase environment variables not found.');
  console.error('Make sure the .env file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to test login
async function testLogin(email, password) {
  console.log(`Attempting to log in with email: ${email}`);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Login failed:', error.message);
  } else {
    console.log('Login successful!');
    console.log('User:', data.user.email);
  }
  console.log('---');
}

// Run tests
async function runTests() {
  console.log('--- Starting Login Tests ---');

  // Test with invalid credentials
  await testLogin('test@test.com', 'password');

  console.log('--- Login Tests Finished ---');
}

runTests();
