CREATE OR REPLACE FUNCTION public.submit_feedback_for_tenant(
    p_location_id uuid,
    p_customer_data jsonb,
    p_responses jsonb,
    p_nps_score int,
    p_channel varchar,
    p_source_url varchar
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    v_tenant_id uuid;
    usage jsonb;
    limits jsonb;
    feedback_count int;
    max_feedbacks int;
    new_feedback feedbacks;
BEGIN
    -- 1. Get tenant_id from location and lock the tenant row for usage update
    SELECT tenant_id INTO v_tenant_id FROM public.locations WHERE id = p_location_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Location not found.';
    END IF;

    SELECT current_usage, usage_limits INTO usage, limits FROM public.tenants WHERE id = v_tenant_id FOR UPDATE;

    -- 2. Check plan limits for feedbacks
    feedback_count := (usage->>'feedbacks_this_month')::int;
    max_feedbacks := (limits->>'max_feedbacks_per_month')::int;

    IF max_feedbacks IS NOT NULL AND max_feedbacks > -1 AND feedback_count >= max_feedbacks THEN
        RAISE EXCEPTION 'Feedback limit reached for this month.';
    END IF;

    -- 3. Insert the new feedback with simulated AI analysis
    INSERT INTO public.feedbacks (
        location_id, customer_data, responses, nps_score, channel, source_url, 
        -- Simulated AI and processing fields
        sentiment, sentiment_score, keywords, topics, status, priority
    )
    VALUES (
        p_location_id, p_customer_data, p_responses, p_nps_score, p_channel, p_source_url,
        'neutral', 0.0, '{}', '{}', 'pending', 'normal' -- Placeholder values
    )
    RETURNING * INTO new_feedback;

    -- 4. Increment the feedback count in tenant usage
    UPDATE public.tenants
    SET current_usage = jsonb_set(usage, '{feedbacks_this_month}', (feedback_count + 1)::text::jsonb)
    WHERE id = v_tenant_id;

    -- 5. Return the new feedback
    RETURN row_to_json(new_feedback);
END;
$$;
