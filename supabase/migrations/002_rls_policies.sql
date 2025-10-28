-- DigaZÉ - Row Level Security Policies
-- Multi-tenant security implementation

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'tenant_id')::UUID,
    (SELECT tenant_id FROM users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role >= required_role
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user belongs to tenant
CREATE OR REPLACE FUNCTION belongs_to_tenant(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND tenant_id = tenant_uuid
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TENANTS POLICIES
-- Users can only see their own tenant
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (
    id = get_current_tenant_id()
  );

-- Only owners and admins can update tenant settings
CREATE POLICY "Owners and admins can update tenant" ON tenants
  FOR UPDATE USING (
    id = get_current_tenant_id() AND
    has_role('admin')
  );

-- USERS POLICIES
-- Users can view other users in their tenant
CREATE POLICY "Users can view users in their tenant" ON users
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (
    id = auth.uid()
  );

-- Admins can manage users in their tenant
CREATE POLICY "Admins can manage users in their tenant" ON users
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    has_role('admin')
  );

-- LOCATIONS POLICIES
-- Users can view locations in their tenant
CREATE POLICY "Users can view locations in their tenant" ON locations
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

-- Managers and above can manage locations
CREATE POLICY "Managers can manage locations" ON locations
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    has_role('manager')
  );

-- FEEDBACKS POLICIES
-- Users can view feedbacks for locations in their tenant
CREATE POLICY "Users can view feedbacks in their tenant" ON feedbacks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM locations l 
      WHERE l.id = feedbacks.location_id 
      AND l.tenant_id = get_current_tenant_id()
    )
  );

-- Staff and above can manage feedbacks
CREATE POLICY "Staff can manage feedbacks" ON feedbacks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM locations l 
      WHERE l.id = feedbacks.location_id 
      AND l.tenant_id = get_current_tenant_id()
    ) AND has_role('staff')
  );

-- Anonymous users can insert feedbacks (for public surveys)
CREATE POLICY "Anonymous can submit feedback" ON feedbacks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM locations l 
      WHERE l.id = feedbacks.location_id 
      AND l.is_active = true
    )
  );

-- EVENTS POLICIES
-- Users can view events in their tenant
CREATE POLICY "Users can view events in their tenant" ON events
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

-- Managers and above can manage events
CREATE POLICY "Managers can manage events" ON events
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    has_role('manager')
  );

-- CAMPAIGNS POLICIES
-- Users can view campaigns in their tenant
CREATE POLICY "Users can view campaigns in their tenant" ON campaigns
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

-- Managers and above can manage campaigns
CREATE POLICY "Managers can manage campaigns" ON campaigns
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    has_role('manager')
  );

-- SUBSCRIPTIONS POLICIES
-- Users can view their tenant's subscription
CREATE POLICY "Users can view their tenant subscription" ON subscriptions
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

-- Only owners can manage subscriptions
CREATE POLICY "Owners can manage subscriptions" ON subscriptions
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    has_role('owner')
  );

-- CUSTOMER SEGMENTS POLICIES
-- Users can view segments in their tenant
CREATE POLICY "Users can view segments in their tenant" ON customer_segments
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
  );

-- Managers and above can manage segments
CREATE POLICY "Managers can manage segments" ON customer_segments
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    has_role('manager')
  );

-- SURVEY TEMPLATES POLICIES
-- Users can view templates in their tenant or public templates
CREATE POLICY "Users can view survey templates" ON survey_templates
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() OR
    is_public = true OR
    tenant_id IS NULL
  );

-- Staff and above can manage templates in their tenant
CREATE POLICY "Staff can manage survey templates" ON survey_templates
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    has_role('staff')
  );

-- API KEYS POLICIES
-- Only admins can view API keys
CREATE POLICY "Admins can view API keys" ON api_keys
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND
    has_role('admin')
  );

-- Only owners can manage API keys
CREATE POLICY "Owners can manage API keys" ON api_keys
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND
    has_role('owner')
  );

-- AUDIT LOGS POLICIES
-- Admins can view audit logs for their tenant
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND
    has_role('admin')
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant limited permissions to anonymous users (for public feedback submission)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON locations TO anon;
GRANT INSERT ON feedbacks TO anon;
GRANT SELECT ON survey_templates TO anon;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  tenant_uuid UUID;
BEGIN
  -- Check if this is the first user (tenant creation)
  IF NOT EXISTS (SELECT 1 FROM users) THEN
    -- Create new tenant
    INSERT INTO tenants (name, subdomain)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
      COALESCE(NEW.raw_user_meta_data->>'subdomain', 'tenant-' || substr(NEW.id::text, 1, 8))
    )
    RETURNING id INTO tenant_uuid;
    
    -- Create owner user
    INSERT INTO users (id, tenant_id, email, role, first_name, last_name, is_active, email_verified)
    VALUES (
      NEW.id,
      tenant_uuid,
      NEW.email,
      'owner',
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      true,
      NEW.email_confirmed_at IS NOT NULL
    );
  ELSE
    -- Add user to existing tenant (invitation flow)
    INSERT INTO users (id, tenant_id, email, role, first_name, last_name, is_active, email_verified)
    VALUES (
      NEW.id,
      COALESCE(
        (NEW.raw_user_meta_data->>'tenant_id')::UUID,
        (SELECT id FROM tenants LIMIT 1) -- Fallback to first tenant
      ),
      NEW.email,
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer'),
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      true,
      NEW.email_confirmed_at IS NOT NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to log user activities
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    get_current_tenant_id(),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_tenants AFTER INSERT OR UPDATE OR DELETE ON tenants FOR EACH ROW EXECUTE FUNCTION log_user_activity();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_user_activity();
CREATE TRIGGER audit_locations AFTER INSERT OR UPDATE OR DELETE ON locations FOR EACH ROW EXECUTE FUNCTION log_user_activity();
CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON subscriptions FOR EACH ROW EXECUTE FUNCTION log_user_activity();