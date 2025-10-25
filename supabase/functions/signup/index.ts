import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { validatePassword } from '../_shared/security.ts';

// Main function to handle requests
async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse request body
    const { email, password, full_name, tenant_name, subdomain } = await req.json();

    // 2. Validate input
    if (!email || !password || !full_name || !tenant_name || !subdomain) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return new Response(JSON.stringify({ error: passwordValidation.errors.join(', ') }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(subdomain)) {
      return new Response(JSON.stringify({ error: 'Invalid subdomain format' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 4. Call the transactional RPC function to create tenant and user
    const { data: signupData, error: rpcError } = await supabaseAdmin.rpc('create_new_tenant_and_user', {
      user_email: email,
      user_password: password,
      user_full_name: full_name,
      tenant_name: tenant_name,
      tenant_subdomain: subdomain,
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      // Check for unique constraint violations
      if (rpcError.message.includes('duplicate key value violates unique constraint')) {
        if (rpcError.message.includes('tenants_subdomain_key')) {
          return new Response(JSON.stringify({ error: 'Subdomain is already taken' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409, // Conflict
          });
        }
        if (rpcError.message.includes('users_email_key')) {
          return new Response(JSON.stringify({ error: 'Email is already registered' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409, // Conflict
          });
        }
      }
      return new Response(JSON.stringify({ error: 'Could not create user and tenant.', details: rpcError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { tenant, user } = signupData;

    // 5. Sign in the new user to get a session
    // Use the public client for this
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign-in Error after signup:', signInError);
      // Even if sign-in fails, the user was created. Return the data without a session.
      return new Response(JSON.stringify({ tenant, user, session: null, warning: 'User created but automatic sign-in failed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201, // Created
      });
    }

    // 6. Return the complete response
    return new Response(JSON.stringify({ tenant, user, session: sessionData.session }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    console.error('Unexpected Error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

// Start the Deno server
addEventListener('fetch', (event) => {
  event.respondWith(handler(event.request));
});
