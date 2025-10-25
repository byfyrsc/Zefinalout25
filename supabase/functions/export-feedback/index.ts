import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Simple CSV converter
function toCSV(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(header => {
                let value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') value = JSON.stringify(value);
                const strValue = String(value);
                // Escape quotes and handle commas
                if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                    return `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            }).join(',')
        )
    ];
    return csvRows.join('\n');
}

const handler = async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        const userRole = user.app_metadata?.role;
        if (!['owner', 'admin', 'manager', 'viewer'].includes(userRole)) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { format = 'json', date_range, location_ids, filters } = await req.json();
        if (format === 'xlsx') return new Response(JSON.stringify({ error: 'XLSX format not supported. Please use CSV or JSON.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        let query = supabase.from('feedbacks').select('*');

        // Apply filters from request body
        if (date_range?.start) query = query.gte('created_at', date_range.start);
        if (date_range?.end) query = query.lte('created_at', date_range.end);
        if (location_ids?.length > 0) query = query.in('location_id', location_ids);
        if (filters) {
            for (const key in filters) {
                query = query.eq(key, filters[key]);
            }
        }

        const { data, error } = await query;
        if (error) return new Response(JSON.stringify({ error: 'Failed to fetch data for export.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        let responseBody: string;
        let contentType: string;
        let filename: string;

        if (format === 'csv') {
            responseBody = toCSV(data || []);
            contentType = 'text/csv';
            filename = 'feedback-export.csv';
        } else { // Default to JSON
            responseBody = JSON.stringify(data, null, 2);
            contentType = 'application/json';
            filename = 'feedback-export.json';
        }

        return new Response(responseBody, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'An unexpected error occurred', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
};

addEventListener('fetch', (event) => {
    event.respondWith(handler(event.request));
});
