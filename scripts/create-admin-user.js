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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // First, create or get the admin tenant
    let adminTenant;
    const { data: existingTenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', 'admin')
      .single();
    
    if (tenantError && tenantError.code !== 'PGRST116') {
      console.error('Error checking for existing tenant:', tenantError);
      return;
    }
    
    if (existingTenant) {
      adminTenant = existingTenant;
      console.log('Using existing admin tenant:', adminTenant.id);
    } else {
      // Create admin tenant
      const { data: newTenant, error: createTenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'Admin Organization',
          subdomain: 'admin',
          plan_id: 'enterprise_plus',
          settings: {
            features: {
              analytics: true,
              campaigns: true,
              events: true,
              api_access: true,
              white_label: true
            }
          }
        })
        .select()
        .single();
      
      if (createTenantError) {
        console.error('Error creating admin tenant:', createTenantError);
        return;
      }
      
      adminTenant = newTenant;
      console.log('Created admin tenant:', adminTenant.id);
    }
    
    // Check if admin user already exists
    const { data: existingUser, error: userCheckError } = await supabase.auth.admin.listUsers();
    
    if (userCheckError) {
      console.error('Error checking existing users:', userCheckError);
      return;
    }
    
    const adminUserExists = existingUser.users.find(user => user.email === 'byfyrsc@gmail.com');
    
    if (adminUserExists) {
      console.log('Admin user already exists:', adminUserExists.id);
      
      // Update user data in our users table
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: adminUserExists.id,
          tenant_id: adminTenant.id,
          email: 'byfyrsc@gmail.com',
          role: 'owner',
          first_name: 'Admin',
          last_name: 'User',
          is_active: true,
          email_verified: true,
          permissions: {
            manage_users: true,
            manage_locations: true,
            manage_campaigns: true,
            manage_events: true,
            view_analytics: true,
            manage_billing: true,
            manage_api_keys: true,
            manage_integrations: true
          }
        });
      
      if (updateError) {
        console.error('Error updating user data:', updateError);
      } else {
        console.log('Admin user data updated successfully');
      }
      
      return;
    }
    
    // Create the admin user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'byfyrsc@gmail.com',
      password: 'Carolteamo@20',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        tenant_id: adminTenant.id
      }
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }
    
    console.log('Created auth user:', authUser.user.id);
    
    // Create user record in our users table
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        tenant_id: adminTenant.id,
        email: 'byfyrsc@gmail.com',
        role: 'owner',
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
        email_verified: true,
        permissions: {
          manage_users: true,
          manage_locations: true,
          manage_campaigns: true,
          manage_events: true,
          view_analytics: true,
          manage_billing: true,
          manage_api_keys: true,
          manage_integrations: true
        }
      })
      .select()
      .single();
    
    if (userDataError) {
      console.error('Error creating user data:', userDataError);
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: byfyrsc@gmail.com');
    console.log('Password: Carolteamo@20');
    console.log('Role: owner');
    console.log('Tenant:', adminTenant.name);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createAdminUser();