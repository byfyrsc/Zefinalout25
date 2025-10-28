CREATE OR REPLACE FUNCTION public.create_campaign_for_tenant(
    p_tenant_id uuid,
    p_name text,
    p_type varchar,
    p_content jsonb,
    p_target_audience jsonb,
    p_created_by uuid,
    p_description text DEFAULT NULL,
    p_schedule jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    usage jsonb;
    limits jsonb;
    campaign_count int;
    max_campaigns int;
    new_campaign campaigns;
BEGIN
    -- 1. Lock tenant row and get usage/limits
    SELECT current_usage, usage_limits INTO usage, limits FROM public.tenants WHERE id = p_tenant_id FOR UPDATE;

    -- 2. Check plan limits for campaigns
    campaign_count := (usage->>'campaigns_this_month')::int;
    max_campaigns := (limits->>'max_campaigns_per_month')::int;

    IF max_campaigns IS NOT NULL AND max_campaigns > -1 AND campaign_count >= max_campaigns THEN
        RAISE EXCEPTION 'Campaign limit reached for this month.';
    END IF;

    -- 3. Insert the new campaign
    INSERT INTO public.campaigns (tenant_id, name, description, type, content, target_audience, schedule, created_by, status)
    VALUES (p_tenant_id, p_name, p_description, p_type, p_content, p_target_audience, p_schedule, p_created_by, 'draft')
    RETURNING * INTO new_campaign;

    -- 4. Increment the campaign count in tenant usage
    UPDATE public.tenants
    SET current_usage = jsonb_set(usage, '{campaigns_this_month}', (campaign_count + 1)::text::jsonb)
    WHERE id = p_tenant_id;

    -- 5. Return the new campaign
    RETURN row_to_json(new_campaign);
END;
$$;
