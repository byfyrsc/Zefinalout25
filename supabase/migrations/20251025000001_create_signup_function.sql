CREATE OR REPLACE FUNCTION public.create_new_tenant_and_user(
    tenant_name text,
    tenant_subdomain text,
    user_email text,
    user_password text,
    user_full_name text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_tenant tenants;
    new_user users;
    new_auth_user_id uuid;
    starter_limits jsonb := '{"max_locations": 1, "max_feedbacks_per_month": 500, "max_campaigns_per_month": 10, "max_users": 5, "max_events": 3, "api_calls_per_hour": 1000, "storage_gb": 1}';
BEGIN
    -- 1. Create the tenant
    INSERT INTO public.tenants (name, subdomain, email, plan_id, usage_limits, address)
    VALUES (
        tenant_name,
        tenant_subdomain,
        user_email,
        'starter',
        starter_limits,
        '{}'::jsonb -- Placeholder address, to be filled in during onboarding
    )
    RETURNING * INTO new_tenant;

    -- 2. Create the auth user and set tenant_id/role in app_metadata
    -- This requires the pgcrypto extension to be enabled.
    INSERT INTO auth.users (email, password, raw_app_meta_data)
    VALUES (
        user_email,
        crypt(user_password, gen_salt('bf')),
        jsonb_build_object('tenant_id', new_tenant.id, 'role', 'owner')
    )
    RETURNING id INTO new_auth_user_id;

    -- 3. Create the public user profile, using the auth user's id as the primary key
    INSERT INTO public.users (id, tenant_id, email, full_name, role)
    VALUES (
        new_auth_user_id,
        new_tenant.id,
        user_email,
        user_full_name,
        'owner'
    )
    RETURNING * INTO new_user;

    -- 4. Return the created records
    RETURN json_build_object('tenant', row_to_json(new_tenant), 'user', row_to_json(new_user));
END;
$$;
