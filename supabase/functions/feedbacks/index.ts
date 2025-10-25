import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const handler = async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return new Response(JSON.stringify({ error: 'Unauthorized', details: userError?.message }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        
        const userRole = user.app_metadata?.role;
        const url = new URL(req.url);
        const pathParts = url.pathname.split('/');
        const feedbackId = pathParts.length >= 4 && pathParts[2] === 'feedbacks' ? pathParts[3] : null;
        const isRespondRequest = pathParts.length >= 5 && pathParts[4] === 'respond';

        switch (req.method) {
            case 'GET': {
                let query = supabase.from('feedbacks').select('*');
                if (userRole === 'manager') {
                    const { data: profile } = await supabase.from('users').select('managed_locations').eq('id', user.id).single();
                    if (profile?.managed_locations?.length > 0) query = query.in('location_id', profile.managed_locations);
                }
                if (feedbackId) {
                    query = query.eq('id', feedbackId).single();
                } else {
                    const page = parseInt(url.searchParams.get('page') || '1', 10);
                    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
                    query = query.range((page - 1) * limit, (page - 1) * limit + limit - 1);
                    if (url.searchParams.has('location_id')) query = query.eq('location_id', url.searchParams.get('location_id'));
                    if (url.searchParams.has('status')) query = query.eq('status', url.searchParams.get('status'));
                    const sort = url.searchParams.get('sort');
                    if (sort) query = query.order(sort.substring(sort.startsWith('-') ? 1 : 0), { ascending: !sort.startsWith('-') });
                }
                const { data, error } = await query;
                if (error) return new Response(JSON.stringify({ error: 'Failed to fetch feedbacks.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'PATCH': {
                if (!['owner', 'admin', 'manager'].includes(userRole)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                if (!feedbackId) return new Response(JSON.stringify({ error: 'Feedback ID is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                const body = await req.json();
                const allowedFields = ['status', 'assigned_to', 'priority'];
                const payload: { [key: string]: any } = {};
                for (const key of allowedFields) if (body[key] !== undefined) payload[key] = body[key];
                if (Object.keys(payload).length === 0) return new Response(JSON.stringify({ error: 'No valid fields to update' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

                const { data, error } = await supabase.from('feedbacks').update(payload).eq('id', feedbackId).select().single();
                if (error) return new Response(JSON.stringify({ error: 'Failed to update feedback', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'POST': {
                if (!isRespondRequest) return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                if (!['owner', 'admin', 'manager', 'staff'].includes(userRole)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                if (!feedbackId) return new Response(JSON.stringify({ error: 'Feedback ID is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

                const { data: feedback, error: fetchError } = await supabase.from('feedbacks').select('assigned_to').eq('id', feedbackId).single();
                if (fetchError) return new Response(JSON.stringify({ error: 'Feedback not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                if (userRole === 'staff' && feedback.assigned_to !== user.id) return new Response(JSON.stringify({ error: 'Forbidden: You can only respond to feedback assigned to you.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

                const { message, mark_as_resolved } = await req.json();
                // TODO: Integrate with email/SMS service to send the message.

                if (mark_as_resolved) {
                    const { error: updateError } = await supabase.from('feedbacks').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', feedbackId);
                    if (updateError) return new Response(JSON.stringify({ error: 'Failed to mark feedback as resolved', details: updateError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }
                return new Response(JSON.stringify({ success: true, response_sent: false /* Set to true when email integration is added */ }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            case 'DELETE': {
                if (!['owner', 'admin'].includes(userRole)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                if (!feedbackId) return new Response(JSON.stringify({ error: 'Feedback ID is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                
                // Soft delete by changing status to 'archived'
                const { error } = await supabase.from('feedbacks').update({ status: 'archived' }).eq('id', feedbackId);
                if (error) return new Response(JSON.stringify({ error: 'Failed to archive feedback', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                return new Response(null, { status: 204, headers: corsHeaders });
            }

            default:
                return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Allow': 'GET, PATCH, POST, DELETE' }, status: 405 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: 'An unexpected error occurred', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
};

addEventListener('fetch', (event) => {
    event.respondWith(handler(event.request));
});
