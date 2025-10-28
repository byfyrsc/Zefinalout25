import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
        const pathParts = url.pathname.split('/'); // e.g., ['', 'api', 'locations', 'uuid', 'stats']
        const locationId = pathParts.length >= 4 && pathParts[2] === 'locations' ? pathParts[3] : null;
        const isStatsRequest = pathParts.length >= 5 && pathParts[4] === 'stats';

        // --- Request Handling ---
        switch (req.method) {
            case 'GET': {
                // Permissions: All authenticated users can view locations.
                if (isStatsRequest) {
                    if (!locationId) return new Response(JSON.stringify({ error: 'Location ID is required for stats.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                    // TODO: Implement stats logic by calling a dedicated RPC function.
                    return new Response(JSON.stringify({ message: 'Stats endpoint not yet implemented.' }), { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                let query = supabase.from('locations').select('*').is('deleted_at', null);

                if (locationId) {
                    query = query.eq('id', locationId).single();
                } else {
                    const page = parseInt(url.searchParams.get('page') || '1', 10);
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
        const pathParts = url.pathname.split('/'); // e.g., ['', 'api', 'locations', 'uuid', 'stats']
        const locationId = pathParts.length >= 4 && pathParts[2] === 'locations' ? pathParts[3] : null;
        const isStatsRequest = pathParts.length >= 5 && pathParts[4] === 'stats';

        // --- Request Handling ---
        switch (req.method) {
            case 'GET': {
                // Permissions: All authenticated users can view locations.
                if (isStatsRequest) {
                    if (!locationId) return new Response(JSON.stringify({ error: 'Location ID is required for stats.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                    
                    const periodParam = url.searchParams.get('period') || '30d';
                    const periodDays = parseInt(periodParam.replace('d', '')) || 30;

                    const { data, error } = await supabase.rpc('get_location_stats', { p_location_id: locationId, p_period_days: periodDays });
                    if (error) return new Response(JSON.stringify({ error: 'Failed to fetch location stats.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                    return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                let query = supabase.from('locations').select('*').is('deleted_at', null);

                if (locationId) {
                    query = query.eq('id', locationId).single();
                } else {
                    const page = parseInt(url.searchParams.get('page') || '1', 10);
                    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
                    query = query.range((page - 1) * limit, (page - 1) * limit + limit - 1);
                }

                const { data, error } = await query;
                if (error) return new Response(JSON.stringify({ error: 'Failed to fetch locations.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'POST': {
                if (!['owner', 'admin', 'manager'].includes(userRole)) {
                    return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to create locations.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                const body = await req.json();
                if (!body.name || !body.address || !body.business_hours) {
                    return new Response(JSON.stringify({ error: 'Missing required fields: name, address, business_hours.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                const { data, error } = await supabase.rpc('create_location_for_tenant', {
                    p_tenant_id: tenantId,
                    p_name: body.name,
                    p_address: body.address,
                    p_business_hours: body.business_hours,
                    p_manager_id: body.manager_id,
                    p_feedback_settings: body.feedback_settings,
                });

                if (error) {
                    // Check for specific error from the RPC function
                    if (error.message.includes('Location limit reached')) {
                        return new Response(JSON.stringify({ error: 'Location limit reached for your current plan.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); // 402 Payment Required
                    }
                    return new Response(JSON.stringify({ error: 'Failed to create location.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            default:
                return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET, POST' },
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

                    query = query.range((page - 1) * limit, (page - 1) * limit + limit - 1);
                }

                const { data, error } = await query;
                if (error) return new Response(JSON.stringify({ error: 'Failed to fetch locations.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'POST': {
                if (!['owner', 'admin', 'manager'].includes(userRole)) {
                    return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to create locations.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                const body = await req.json();
                if (!body.name || !body.address || !body.business_hours) {
                    return new Response(JSON.stringify({ error: 'Missing required fields: name, address, business_hours.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                const { data, error } = await supabase.rpc('create_location_for_tenant', {
                    p_tenant_id: tenantId,
                    p_name: body.name,
                    p_address: body.address,
                    p_business_hours: body.business_hours,
                    p_manager_id: body.manager_id,
                    p_feedback_settings: body.feedback_settings,
                });

                if (error) {
                    // Check for specific error from the RPC function
                    if (error.message.includes('Location limit reached')) {
                        return new Response(JSON.stringify({ error: 'Location limit reached for your current plan.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); // 402 Payment Required
                    }
                    return new Response(JSON.stringify({ error: 'Failed to create location.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            default:
                return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET, POST' },
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
