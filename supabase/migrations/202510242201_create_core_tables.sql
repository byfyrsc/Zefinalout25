-- TENANTS (Organizações)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(50) UNIQUE NOT NULL 
    CHECK (subdomain ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  
  -- Endereço
  address JSONB NOT NULL,
  
  -- Plano e Billing
  plan_id VARCHAR(50) NOT NULL 
    DEFAULT 'starter'
    CHECK (plan_id IN ('starter', 'professional', 'enterprise', 'enterprise_plus')),
  subscription_status VARCHAR(20) NOT NULL 
    DEFAULT 'trialing'
    CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  
  -- Branding
  branding JSONB DEFAULT '{}',
  
  -- Configurações
  settings JSONB DEFAULT '{}',
  
  -- Limites e Uso
  usage_limits JSONB NOT NULL,
  current_usage JSONB DEFAULT '{}',
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_plan ON tenants(plan_id);

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Autenticação (gerenciada pelo Supabase Auth)
  auth_id UUID UNIQUE NOT NULL,  -- Referência ao auth.users
  email VARCHAR(255) UNIQUE NOT NULL,
  
  -- Perfil
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  
  -- Permissões
  role VARCHAR(20) NOT NULL 
    DEFAULT 'viewer'
    CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
  permissions JSONB DEFAULT '[]',
  
  -- Gerenciamento de Locais (para managers)
  managed_locations UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Preferências
  language VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  notification_preferences JSONB DEFAULT '{}',
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  
  -- Auditoria
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
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  
  -- Endereço
  address JSONB NOT NULL,
  coordinates POINT,  -- PostGIS para geolocalização
  
  -- Gerenciamento
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Horários
  business_hours JSONB NOT NULL DEFAULT '{}',
  
  -- Configurações de Feedback
  feedback_settings JSONB DEFAULT '{
    "enabled": true,
    "auto_reply": false,
    "require_moderation": false,
    "min_nps_for_public": 7
  }',
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
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
  
  -- Dados do Cliente
  customer_data JSONB,
  customer_id UUID,  -- Se cliente cadastrado
  
  -- Respostas
  responses JSONB NOT NULL,
  
  -- Scores
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  
  -- Análise AI
  sentiment VARCHAR(20) 
    CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  keywords TEXT[],
  topics TEXT[],
  ai_summary TEXT,
  
  -- Metadados
  channel VARCHAR(20) NOT NULL 
    CHECK (channel IN ('qrcode', 'email', 'sms', 'whatsapp', 'webapp', 'kiosk')),
  source_url VARCHAR(500),
  device_info JSONB,
  
  -- Estado e Gestão
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'archived')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Timestamps
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
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tipo e Canal
  type VARCHAR(20) NOT NULL 
    CHECK (type IN ('email', 'sms', 'whatsapp', 'push', 'in_app')),
  
  -- Conteúdo
  content JSONB NOT NULL,
  template_id UUID,
  
  -- Público-alvo
  target_audience JSONB NOT NULL,
  estimated_reach INTEGER,
  
  -- Agendamento
  schedule JSONB,
  send_at TIMESTAMP,
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  
  -- Estado
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'failed')),
  
  -- Métricas
  metrics JSONB DEFAULT '{
    "sent": 0,
    "delivered": 0,
    "opened": 0,
    "clicked": 0,
    "converted": 0,
    "bounced": 0,
    "unsubscribed": 0
  }',
  
  -- Auditoria
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
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Tipo
  type VARCHAR(50) NOT NULL 
    CHECK (type IN ('engagement_boost', 'recovery_campaign', 'lifecycle_celebration', 
                    'flash_campaign', 'feedback_challenge')),
  
  -- Configuração
  config JSONB NOT NULL,
  
  -- Datas
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
  
  -- Métricas
  metrics JSONB DEFAULT '{
    "participants": 0,
    "completions": 0,
    "rewards_claimed": 0,
    "engagement_rate": 0
  }',
  
  -- Auditoria
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
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Critérios
  criteria JSONB NOT NULL,
  
  -- Membros (cache)
  member_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP,
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_segments_tenant ON customer_segments(tenant_id);

-- INVITATIONS
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Convite
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL 
    CHECK (role IN ('admin', 'manager', 'staff', 'viewer')),
  
  -- Token
  token VARCHAR(255) UNIQUE NOT NULL,
  
  -- Estado
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Auditoria
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
  
  -- Ação
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  
  -- Detalhes
  details JSONB,
  changes JSONB,  -- Before/After para updates
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- API_KEYS
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Chave
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,  -- Primeiros caracteres para identificação
  
  -- Permissões
  permissions JSONB NOT NULL DEFAULT '[]',
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Limites
  rate_limit INTEGER DEFAULT 1000,  -- Requests por hora
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  
  -- Auditoria
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoked_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = TRUE;