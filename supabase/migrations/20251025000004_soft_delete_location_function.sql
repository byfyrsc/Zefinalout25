-- Append this to 20251025000003_create_location_functions.sql or create a new migration

CREATE OR REPLACE FUNCTION public.soft_delete_location(
    p_location_id uuid,
    p_tenant_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    usage jsonb;
    location_count int;
BEGIN
    -- 1. Lock tenant row and get usage to prevent race conditions
    SELECT current_usage INTO usage FROM public.tenants WHERE id = p_tenant_id FOR UPDATE;
    location_count := (usage->>'locations')::int;

    -- 2. Soft delete the location
    UPDATE public.locations
    SET deleted_at = NOW()
    WHERE id = p_location_id AND tenant_id = p_tenant_id;

    -- 3. Decrement the location count if it was greater than 0
    IF location_count > 0 THEN
        UPDATE public.tenants
        SET current_usage = jsonb_set(usage, '{locations}', (location_count - 1)::text::jsonb)
        WHERE id = p_tenant_id;
    END IF;

END;
$$;
