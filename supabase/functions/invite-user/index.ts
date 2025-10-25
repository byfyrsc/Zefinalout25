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

        if (!['owner', 'admin'].includes(userRole)) {
            return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to invite users.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // --- Body Parsing and Validation ---
        const { email, role } = await req.json();
        if (!email || !role) {
            return new Response(JSON.stringify({ error: 'Missing required fields: email, role.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (userRole === 'admin' && role === 'owner') {
            return new Response(JSON.stringify({ error: 'Forbidden: Admins cannot invite owner users.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Check if user or pending invite already exists for this tenant
        const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
        if (existingUser) {
            return new Response(JSON.stringify({ error: 'A user with this email already exists in the tenant.' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const { data: existingInvite } = await supabase.from('invitations').select('id').eq('email', email).is('used_at', null).single();
        if (existingInvite) {
            return new Response(JSON.stringify({ error: 'An invitation for this email is already pending.' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // --- Invitation Creation ---
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Invitation valid for 7 days

        const invitation = {
            tenant_id: tenantId,
            email,
            role,
            token,
            expires_at: expiresAt.toISOString(),
            invited_by: user.id,
        };

        const { data: newInvite, error } = await supabase
            .from('invitations')
            .insert(invitation)
            .select()
            .single();

        if (error) {
            return new Response(JSON.stringify({ error: 'Failed to create invitation.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // In a real application, an email would be sent here with a link like:
        // const inviteLink = `${Deno.env.get('SITE_URL')}/accept-invite?token=${token}`;
        // await sendEmail(email, 'You have been invited!', `Click here to accept: ${inviteLink}`);

        return new Response(JSON.stringify(newInvite), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

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
