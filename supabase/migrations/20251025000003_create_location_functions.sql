CREATE OR REPLACE FUNCTION public.create_location_for_tenant(
    p_tenant_id uuid,
    p_name text,
    p_address jsonb,
    p_business_hours jsonb,
    p_manager_id uuid DEFAULT NULL,
    p_feedback_settings jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    usage jsonb;
    limits jsonb;
    location_count int;
    max_locations int;
    new_location locations;
BEGIN
    -- 1. Lock tenant row and get usage/limits to prevent race conditions
    SELECT current_usage, usage_limits INTO usage, limits FROM public.tenants WHERE id = p_tenant_id FOR UPDATE;

    -- 2. Check plan limits
    location_count := (usage->>'locations')::int;
    max_locations := (limits->>'max_locations')::int;

    IF max_locations IS NOT NULL AND max_locations > -1 AND location_count >= max_locations THEN
        RAISE EXCEPTION 'Location limit reached for your current plan.';
    END IF;

    -- 3. Insert the new location
    INSERT INTO public.locations (tenant_id, name, slug, address, business_hours, manager_id, feedback_settings)
    VALUES (
        p_tenant_id,
        p_name,
        slugify(p_name), -- Assumes a slugify function exists
        p_address,
        p_business_hours,
        p_manager_id,
        p_feedback_settings
    )
    RETURNING * INTO new_location;

    -- 4. Increment the location count in tenant usage
    UPDATE public.tenants
    SET current_usage = jsonb_set(usage, '{locations}', (location_count + 1)::text::jsonb)
    WHERE id = p_tenant_id;

    -- 5. Return the new location
    RETURN row_to_json(new_location);
END;
$$;

-- Helper function to generate slugs from names. This should be created if it doesn't exist.
CREATE OR REPLACE FUNCTION public.slugify(text)
RETURNS text AS $$
    WITH unaccented AS (
        SELECT unaccent(lower($1)) AS str
    ), normalized AS (
        SELECT regexp_replace(str, '[^a-z0-9]+|', '-', 'g') AS str FROM unaccented
    ) SELECT trim(both '-' FROM str) FROM normalized;
$$ LANGUAGE sql IMMUTABLE;
