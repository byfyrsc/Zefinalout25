CREATE OR REPLACE FUNCTION public.create_user_for_tenant(
    p_tenant_id uuid,
    p_email text,
    p_password text,
    p_full_name text,
    p_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user users;
    new_auth_user_id uuid;
BEGIN
    -- 1. Create the auth user and set tenant_id/role in app_metadata
    INSERT INTO auth.users (email, password, raw_app_meta_data)
    VALUES (
        p_email,
        crypt(p_password, gen_salt('bf')),
        jsonb_build_object('tenant_id', p_tenant_id, 'role', p_role)
    )
    RETURNING id INTO new_auth_user_id;

    -- 2. Create the public user profile, using the auth user's id as the primary key
    INSERT INTO public.users (id, tenant_id, email, full_name, role)
    VALUES (
        new_auth_user_id,
        p_tenant_id,
        p_email,
        p_full_name,
        p_role::varchar
    )
    RETURNING * INTO new_user;

    -- 3. Return the created user profile
    RETURN row_to_json(new_user);
END;
$$;
