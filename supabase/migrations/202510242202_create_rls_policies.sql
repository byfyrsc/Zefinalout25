-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tenants
CREATE POLICY "tenants_isolation" ON tenants
  FOR ALL USING (
    id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    id = auth.jwt() ->> 'tenant_id'
  );

-- RLS Policies for Users
CREATE POLICY "users_tenant_isolation" ON users
  FOR ALL USING (
    tenant_id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
  );

-- RLS Policies for Locations
CREATE POLICY "locations_tenant_isolation" ON locations
  FOR ALL USING (
    tenant_id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
  );

-- RLS Policies for Feedbacks
CREATE POLICY "feedbacks_tenant_isolation" ON feedbacks
  FOR ALL USING (
    location_id IN (
      SELECT id FROM locations
      WHERE tenant_id = auth.jwt() ->> 'tenant_id'
    )
  ) WITH CHECK (
    location_id IN (
      SELECT id FROM locations
      WHERE tenant_id = auth.jwt() ->> 'tenant_id'
    )
  );

-- RLS Policies for Campaigns
CREATE POLICY "campaigns_tenant_isolation" ON campaigns
  FOR ALL USING (
    tenant_id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
  );

-- RLS Policies for Events
CREATE POLICY "events_tenant_isolation" ON events
  FOR ALL USING (
    tenant_id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
  );

-- RLS Policies for Customer Segments
CREATE POLICY "customer_segments_tenant_isolation" ON customer_segments
  FOR ALL USING (
    tenant_id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
  );

-- RLS Policies for Invitations
CREATE POLICY "invitations_tenant_isolation" ON invitations
  FOR ALL USING (
    tenant_id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
  );

-- RLS Policies for Audit Logs
CREATE POLICY "audit_logs_tenant_isolation" ON audit_logs
  FOR ALL USING (
    tenant_id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
  );

-- RLS Policies for API Keys
CREATE POLICY "api_keys_tenant_isolation" ON api_keys
  FOR ALL USING (
    tenant_id = auth.jwt() ->> 'tenant_id'
  ) WITH CHECK (
    tenant_id = auth.jwt() ->> 'tenant_id'
  );