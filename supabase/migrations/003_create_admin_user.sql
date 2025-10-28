-- Create admin tenant if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tenants WHERE subdomain = 'admin') THEN
    INSERT INTO tenants (id, name, subdomain, plan_id, settings, branding, monthly_feedback_limit, location_limit)
    VALUES (
      '7a1e4971-1e89-47fe-b5f0-a4751ffe8408',
      'Admin Organization',
      'admin',
      'enterprise_plus',
      '{
        "features": {
          "analytics": true,
          "campaigns": true,
          "events": true,
          "api_access": true,
          "white_label": true
        }
      }'::jsonb,
      '{}'::jsonb,
      10000,
      100
    );
  END IF;
END $$;

-- Create admin user in auth.users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'byfyrsc@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at
    ) VALUES (
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'byfyrsc@gmail.com',
      crypt('Carolteamo@20', gen_salt('bf')),
      NOW(),
      NOW(),
      '',
      NOW(),
      '',
      NULL,
      '',
      '',
      NULL,
      NULL,
      '{"provider": "email", "providers": ["email"]}',
      '{"first_name": "Admin", "last_name": "User", "tenant_id": "7a1e4971-1e89-47fe-b5f0-a4751ffe8408"}',
      false,
      NOW(),
      NOW(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL
    );
  END IF;
END $$;

-- Create admin user in public.users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') THEN
    INSERT INTO users (
      id,
      tenant_id,
      email,
      role,
      first_name,
      last_name,
      is_active,
      email_verified,
      permissions,
      profile_data
    ) VALUES (
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      '7a1e4971-1e89-47fe-b5f0-a4751ffe8408',
      'byfyrsc@gmail.com',
      'owner',
      'Admin',
      'User',
      true,
      true,
      '{
        "manage_users": true,
        "manage_locations": true,
        "manage_campaigns": true,
        "manage_events": true,
        "view_analytics": true,
        "manage_billing": true,
        "manage_api_keys": true,
        "manage_integrations": true
      }'::jsonb,
      '{
        "avatar_url": null,
        "bio": "System Administrator",
        "timezone": "America/Sao_Paulo"
      }'::jsonb
    );
  END IF;
END $$;

-- Create identity for the user
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' AND provider = 'email') THEN
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      '{"sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "email": "byfyrsc@gmail.com"}',
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;