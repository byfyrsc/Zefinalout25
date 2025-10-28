-- Add missing tables to align with frontend services
-- Subscriptions and Survey Templates

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL
    CHECK (plan_id IN ('starter', 'professional', 'enterprise', 'enterprise_plus')),
  status VARCHAR(20) NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  price_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  start_date TIMESTAMP DEFAULT NOW(),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- SURVEY_TEMPLATES
CREATE TABLE IF NOT EXISTS survey_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  questions JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_survey_templates_tenant ON survey_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_survey_templates_public ON survey_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_survey_templates_usage ON survey_templates(usage_count DESC);

-- Triggers for updated_at
DO $$ BEGIN
  CREATE TRIGGER set_timestamp BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER set_timestamp BEFORE UPDATE ON survey_templates FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: isolate by tenant
DO $$ BEGIN
  CREATE POLICY subscription_isolation ON subscriptions
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Survey templates: allow public read for public templates; tenant isolation otherwise
DO $$ BEGIN
  CREATE POLICY survey_templates_public_read ON survey_templates
    FOR SELECT USING (is_public = TRUE OR (tenant_id IS NOT NULL AND tenant_id = (auth.jwt() ->> 'tenant_id')::uuid));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY survey_templates_tenant_write ON survey_templates
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (
      -- allow tenant-owned templates to be created/updated
      (tenant_id IS NOT NULL AND tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
      -- disallow writes to global public templates (tenant_id IS NULL)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
