import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

async function handler(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Get user from Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized', details: userError?.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        // 2. Handle request based on method
        switch (req.method) {
            case 'GET': {
                const { data: tenant, error: tenantError } = await supabase
                    .from('tenants')
                    .select('*')
                    .single();

                if (tenantError) {
                    return new Response(JSON.stringify({ error: 'Could not fetch tenant information', details: tenantError.message }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 500,
                    });
                }
                return new Response(JSON.stringify(tenant), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }

            case 'PATCH': {
                const userRole = user.app_metadata?.role;
                if (userRole !== 'owner' && userRole !== 'admin') {
                    return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to update tenant settings.' }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 403,
                    });
                }

                const body = await req.json();
                const allowedFields = ['name', 'phone', 'address', 'branding', 'settings'];
                const payload: { [key: string]: any } = {};

                for (const key of allowedFields) {
                    if (body[key] !== undefined) {
                        payload[key] = body[key];
                    }
                }

                if (Object.keys(payload).length === 0) {
                    return new Response(JSON.stringify({ error: 'No valid fields to update provided.' }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 400,
                    });
                }

                const { data: updatedTenant, error: updateError } = await supabase
                    .from('tenants')
                    .update(payload)
                    .select()
                    .single();

                if (updateError) {
                    return new Response(JSON.stringify({ error: 'Failed to update tenant.', details: updateError.message }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 500,
                    });
                }

                return new Response(JSON.stringify(updatedTenant), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }

            default:
                return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET, PATCH' },
                    status: 405,
                });
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: 'An unexpected error occurred', details: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}

addEventListener('fetch', (event) => {
    event.respondWith(handler(event.request));
});
