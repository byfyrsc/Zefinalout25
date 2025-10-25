-- Phase 1: Table Creation

-- TENANTS (Organizações)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(50) UNIQUE NOT NULL 
    CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address JSONB NOT NULL,
  plan_id VARCHAR(50) NOT NULL 
    DEFAULT 'starter'
    CHECK (plan_id IN ('starter', 'professional', 'enterprise', 'enterprise_plus')),
  subscription_status VARCHAR(20) NOT NULL 
    DEFAULT 'trialing'
    CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  branding JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  usage_limits JSONB NOT NULL,
  current_usage JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_plan ON tenants(plan_id);

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Set manually from auth.users.id
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL 
    DEFAULT 'viewer'
    CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
  permissions JSONB DEFAULT '[]',
  managed_locations UUID[] DEFAULT ARRAY[]::UUID[],
  language VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  notification_preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(tenant_id, role);

-- LOCATIONS (Restaurantes)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  address JSONB NOT NULL,
  coordinates POINT,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  business_hours JSONB NOT NULL DEFAULT '{}',
  feedback_settings JSONB DEFAULT '{
    "enabled": true,
    "auto_reply": false,
    "require_moderation": false,
    "min_nps_for_public": 7
  }',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  CONSTRAINT unique_location_slug_per_tenant UNIQUE (tenant_id, slug)
);
CREATE INDEX idx_locations_tenant ON locations(tenant_id);
CREATE INDEX idx_locations_manager ON locations(manager_id);
CREATE INDEX idx_locations_coordinates ON locations USING GIST(coordinates);

-- FEEDBACKS
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  customer_data JSONB,
  customer_id UUID,
  responses JSONB NOT NULL,
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  sentiment VARCHAR(20) 
    CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  keywords TEXT[],
  topics TEXT[],
  ai_summary TEXT,
  channel VARCHAR(20) NOT NULL 
    CHECK (channel IN ('qrcode', 'email', 'sms', 'whatsapp', 'webapp', 'kiosk')),
  source_url VARCHAR(500),
  device_info JSONB,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'archived')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  reviewed_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_feedbacks_location ON feedbacks(location_id);
CREATE INDEX idx_feedbacks_created_at ON feedbacks(location_id, created_at DESC);
CREATE INDEX idx_feedbacks_status ON feedbacks(location_id, status);
CREATE INDEX idx_feedbacks_sentiment ON feedbacks(sentiment);
CREATE INDEX idx_feedbacks_nps ON feedbacks(nps_score);
CREATE INDEX idx_feedbacks_assigned ON feedbacks(assigned_to);

-- CAMPAIGNS
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL 
    CHECK (type IN ('email', 'sms', 'whatsapp', 'push', 'in_app')),
  content JSONB NOT NULL,
  template_id UUID,
  target_audience JSONB NOT NULL,
  estimated_reach INTEGER,
  schedule JSONB,
  send_at TIMESTAMP,
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'failed')),
  metrics JSONB DEFAULT '{
    "sent": 0,
    "delivered": 0,
    "opened": 0,
    "clicked": 0,
    "converted": 0,
    "bounced": 0,
    "unsubscribed": 0
  }',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  completed_at TIMESTAMP
);
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_send_at ON campaigns(send_at) WHERE status = 'scheduled';

-- EVENTS (Eventos Gamificados)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL 
    CHECK (type IN ('engagement_boost', 'recovery_campaign', 'lifecycle_celebration', 
                    'flash_campaign', 'feedback_challenge')),
  config JSONB NOT NULL,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
  metrics JSONB DEFAULT '{
    "participants": 0,
    "completions": 0,
    "rewards_claimed": 0,
    "engagement_rate": 0
  }',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_event_dates CHECK (ends_at > starts_at)
);
CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_dates ON events(starts_at, ends_at);

-- CUSTOMER_SEGMENTS
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  member_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_segments_tenant ON customer_segments(tenant_id);

-- INVITATIONS
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL 
    CHECK (role IN ('admin', 'manager', 'staff', 'viewer')),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_pending_invitation UNIQUE (tenant_id, email) 
    WHERE used_at IS NULL
);
CREATE INDEX idx_invitations_token ON invitations(token) WHERE used_at IS NULL;
CREATE INDEX idx_invitations_email ON invitations(email) WHERE used_at IS NULL;

-- AUDIT_LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- API_KEYS
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoked_by UUID REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = TRUE;

-- Phase 2: Triggers for automatic `updated_at` timestamp

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with `updated_at`
CREATE TRIGGER set_timestamp BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON locations FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON feedbacks FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp BEFORE UPDATE ON customer_segments FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Phase 3: Row Level Security (RLS) for Multi-Tenancy

-- Enable RLS for all relevant tables
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

-- RLS Policies
-- Tenants can only see their own tenant record.
CREATE POLICY "tenant_isolation" ON tenants
  FOR ALL USING (id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Users can only see records belonging to their tenant.
CREATE POLICY "user_isolation" ON users
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Locations can only see records belonging to their tenant.
CREATE POLICY "location_isolation" ON locations
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Campaigns can only see records belonging to their tenant.
CREATE POLICY "campaign_isolation" ON campaigns
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Events can only see records belonging to their tenant.
CREATE POLICY "event_isolation" ON events
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Customer Segments can only see records belonging to their tenant.
CREATE POLICY "customer_segment_isolation" ON customer_segments
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Invitations can only see records belonging to their tenant.
CREATE POLICY "invitation_isolation" ON invitations
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Audit Logs can only see records belonging to their tenant.
CREATE POLICY "audit_log_isolation" ON audit_logs
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- API Keys can only see records belonging to their tenant.
CREATE POLICY "api_key_isolation" ON api_keys
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Feedbacks have a special policy based on the location's tenant.
CREATE POLICY "feedback_isolation" ON feedbacks
  FOR ALL USING (
    location_id IN (
      SELECT id FROM locations 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

-- Phase 4: Materialized Views for Performance

-- DAILY_FEEDBACK_SUMMARY
CREATE MATERIALIZED VIEW daily_feedback_summary AS
SELECT 
  l.tenant_id,
  f.location_id,
  DATE(f.created_at) as feedback_date,
  COUNT(*) as total_feedbacks,
  AVG(f.nps_score) as avg_nps,
  AVG(f.overall_rating) as avg_rating,
  COUNT(*) FILTER (WHERE f.sentiment = 'positive') as positive_count,
  COUNT(*) FILTER (WHERE f.sentiment = 'neutral') as neutral_count,
  COUNT(*) FILTER (WHERE f.sentiment = 'negative') as negative_count,
  COUNT(*) FILTER (WHERE f.nps_score >= 9) as promoters,
  COUNT(*) FILTER (WHERE f.nps_score >= 7 AND f.nps_score <= 8) as passives,
  COUNT(*) FILTER (WHERE f.nps_score <= 6) as detractors
FROM feedbacks f
JOIN locations l ON f.location_id = l.id
GROUP BY l.tenant_id, f.location_id, DATE(f.created_at);

CREATE UNIQUE INDEX idx_daily_summary_unique 
  ON daily_feedback_summary(tenant_id, location_id, feedback_date);

-- TENANT_STATISTICS
CREATE MATERIALIZED VIEW tenant_statistics AS
SELECT 
  t.id as tenant_id,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT l.id) as total_locations,
  COUNT(DISTINCT f.id) as total_feedbacks,
  COUNT(DISTINCT f.id) FILTER (
    WHERE f.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  ) as feedbacks_this_month,
  AVG(f.nps_score) as avg_nps_score,
  AVG(f.overall_rating) as avg_overall_rating
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id AND u.deleted_at IS NULL
LEFT JOIN locations l ON t.id = l.tenant_id AND l.deleted_at IS NULL
LEFT JOIN feedbacks f ON l.id = f.location_id
WHERE t.deleted_at IS NULL
GROUP BY t.id;

CREATE UNIQUE INDEX idx_tenant_stats_unique ON tenant_statistics(tenant_id);

-- Note: Automatic refresh for materialized views needs to be configured separately,
-- for example, using pg_cron or a similar scheduling mechanism.
-- Example refresh command: REFRESH MATERIALIZED VIEW CONCURRENTLY daily_feedback_summary;
