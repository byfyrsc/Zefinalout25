import { supabase } from './supabase';
import { UserRegistration, UserLogin } from '../types/auth'; // Assuming these types exist or will be created
import type { Tenant, Json } from '../types/database';
import { PlanType, UserRole } from '../types/database';
import { User, Session } from '@supabase/supabase-js';

export async function signUp(data: UserRegistration): Promise<{ user: User | null; tenant: Tenant | null; session: Session | null; error: Error | null }> {
  try {
    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: 'owner', // Initial role for the signing up user
        },
      },
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user || !authData.session) {
      throw new Error('User or session not returned after signup.');
    }

    // Then, create the tenant and the user in our public schema
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: data.tenant_name,
        subdomain: data.subdomain,
        email: data.email,
        address: data.address as unknown as Json,
        plan_id: PlanType.STARTER, // Default plan
        usage_limits: {} as Json, // To be populated based on plan
        current_usage: {} as Json,
      })
      .select()
      .single();

    // tenantId already defined above

    if (tenantError || !tenantData) {
      // If tenant creation fails, attempt to delete the auth user to prevent orphaned accounts
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw (tenantError ?? new Error('Tenant creation failed'));
    }

    const { data: userData, error: userError } = await db
      .from('users')
      .insert({
        tenant_id: tenantId,
        auth_id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        role: UserRole.OWNER,
        is_active: true,
        email_verified: authData.user.email_confirmed_at !== null,
      } as unknown as never)
      .select()
      .single();

    if (userError) {
      // If user creation fails, attempt to delete the tenant and auth user
      await supabase.from('tenants').delete().eq('id', tenantId);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return { user: authData.user, tenant: tenantData, session: authData.session, error: null };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Signup failed');
    console.error('Signup error:', err);
    return { user: null, tenant: null, session: null, error: err };
  }
}

export async function signIn(data: UserLogin): Promise<{ access_token: string | null; refresh_token: string | null; user: User | null; error: Error | null }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.session || !authData.user) {
      throw new Error('Session or user not returned after signin.');
    }

    return {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: authData.user,
      error: null,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Signin failed');
    console.error('Signin error:', err);
    return { access_token: null, refresh_token: null, user: null, error: err };
  }
}

export async function refreshSession(refreshToken: string): Promise<{ access_token: string | null; refresh_token: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('Session not returned after refresh.');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      error: null,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Refresh session failed');
    console.error('Refresh session error:', err);
    return { access_token: null, refresh_token: null, error: err };
  }
}