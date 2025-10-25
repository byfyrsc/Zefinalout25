import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { validatePassword } from '../_shared/security.ts';

const handler = async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // --- Authentication and Authorization ---
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized', details: userError?.message }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const userRole = user.app_metadata?.role;
        const tenantId = user.app_metadata?.tenant_id;

        // --- URL Parsing ---
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const userIdFromPath = pathParts[pathParts.length - 1] && pathParts[pathParts.length - 2] === 'users' ? pathParts[pathParts.length - 1] : null;

        // --- Admin Client (for privileged operations) ---
        const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

        // --- Request Handling ---
        switch (req.method) {
            case 'GET': {
                if (!['owner', 'admin', 'manager'].includes(userRole)) {
                    return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to view users.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                let query = supabase.from('users').select('*').is('deleted_at', null);

                if (userIdFromPath) {
                    query = query.eq('id', userIdFromPath).single();
                } else {
                    const page = parseInt(url.searchParams.get('page') || '1', 10);
                    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
                    const role = url.searchParams.get('role');
                    query = query.range((page - 1) * limit, (page - 1) * limit + limit - 1);
                    if (role) query = query.eq('role', role);
                }

                const { data, error } = await query;
                if (error) return new Response(JSON.stringify({ error: 'Failed to fetch users.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'POST': {
                if (!['owner', 'admin'].includes(userRole)) {
                    return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to create users.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                const { email, password, full_name, role } = await req.json();
                if (!email || !password || !full_name || !role) {
                    return new Response(JSON.stringify({ error: 'Missing required fields: email, password, full_name, role.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                if (userRole === 'admin' && role === 'owner') {
                    return new Response(JSON.stringify({ error: 'Forbidden: Admins cannot create owner users.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.valid) {
                    return new Response(JSON.stringify({ error: passwordValidation.errors.join(', ') }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                const { data, error } = await supabaseAdmin.rpc('create_user_for_tenant', { p_tenant_id: tenantId, p_email: email, p_password: password, p_full_name: full_name, p_role: role });
                if (error) return new Response(JSON.stringify({ error: 'Failed to create user.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'PATCH': {
                if (!['owner', 'admin'].includes(userRole)) {
                    return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to update users.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                if (!userIdFromPath) return new Response(JSON.stringify({ error: 'User ID is required in the URL.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

                const body = await req.json();
                const { role: newRole, ...profileData } = body;

                if (newRole && userRole === 'admin' && newRole === 'owner') {
                    return new Response(JSON.stringify({ error: 'Forbidden: Admins cannot assign the owner role.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                // Update auth user metadata if role is changing
                if (newRole) {
                    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userIdFromPath, { app_metadata: { role: newRole, tenant_id: tenantId } });
                    if (authError) return new Response(JSON.stringify({ error: 'Failed to update user role.', details: authError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                    profileData.role = newRole;
                }

                const { data, error } = await supabase.from('users').update(profileData).eq('id', userIdFromPath).select().single();
                if (error) return new Response(JSON.stringify({ error: 'Failed to update user profile.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'DELETE': {
                if (!['owner', 'admin'].includes(userRole)) {
                    return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to delete users.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                if (!userIdFromPath) return new Response(JSON.stringify({ error: 'User ID is required in the URL.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                if (userIdFromPath === user.id) return new Response(JSON.stringify({ error: 'You cannot delete your own account.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

                // Soft delete from public.users
                const { error: profileError } = await supabase.from('users').update({ deleted_at: new Date().toISOString() }).eq('id', userIdFromPath);
                if (profileError) return new Response(JSON.stringify({ error: 'Failed to soft-delete user profile.', details: profileError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

                // Disable user in auth schema
                const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userIdFromPath, { ban_duration: 'inf' });
                if (authError) return new Response(JSON.stringify({ error: 'Failed to disable user in auth system.', details: authError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

                return new Response(null, { status: 204, headers: corsHeaders });
            }

            default:
                return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET, POST, PATCH, DELETE' },
                    status: 405,
                });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: 'An unexpected error occurred', details: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
};

addEventListener('fetch', (event) => {
    event.respondWith(handler(event.request));
});
