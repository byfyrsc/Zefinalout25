import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Use a public client to sign in
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return new Response(JSON.stringify({ error: 'Invalid login credentials', details: signInError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    if (!signInData.user) {
        return new Response(JSON.stringify({ error: 'User not found after sign-in' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    // The user is authenticated. Now, fetch their profile from the public.users table.
    // We need to use an admin client to bypass RLS if necessary, or ensure the user can read their own profile.
    // The RLS policy for `users` only checks for tenant_id, which isn't available before we have the profile.
    // A better approach is a SECURITY_DEFINER function to get the user's own profile.
    // For now, we will use the service role key for simplicity.
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
        return new Response(JSON.stringify({ error: 'Could not retrieve user profile after login.', details: profileError.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    // As per the documentation, return access_token, refresh_token, and the user profile.
    return new Response(JSON.stringify({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: userProfile,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

addEventListener('fetch', (event) => {
  event.respondWith(handler(event.request));
});
