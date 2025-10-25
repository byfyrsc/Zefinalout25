import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

async function handler(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET' },
            status: 405,
        });
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

        // 2. Query for the tenant's usage and limits
        const { data, error } = await supabase
            .from('tenants')
            .select('current_usage, usage_limits')
            .single();

        if (error) {
            return new Response(JSON.stringify({ error: 'Could not fetch tenant usage information', details: error.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        const { current_usage, usage_limits } = data;

        // 3. Calculate percentage used
        const percentage_used: { [key: string]: number } = {};
        if (usage_limits && current_usage) {
            for (const key in usage_limits) {
                const limit = usage_limits[key];
                // Find corresponding usage key (e.g., limit 'max_users' corresponds to usage 'total_users')
                const usageKey = key.replace('max_', '').replace('_per_month', '_this_month');
                const usage = current_usage[usageKey] ?? 0;

                if (limit === null || limit === undefined) {
                    percentage_used[usageKey] = 0;
                } else if (limit < 0) { // Infinite limit
                    percentage_used[usageKey] = 0; 
                } else if (limit === 0) {
                    percentage_used[usageKey] = 100;
                } else {
                    percentage_used[usageKey] = Math.round((usage / limit) * 100);
                }
            }
        }

        // 4. Return the data
        return new Response(JSON.stringify({ current_usage, limits: usage_limits, percentage_used }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

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
