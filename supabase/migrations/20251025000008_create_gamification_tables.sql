-- Create Gamification Tables

-- GAMIFICATION_PROFILES
CREATE TABLE gamification_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    streaks JSONB DEFAULT '{}',
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_gamification_profiles_tenant ON gamification_profiles(tenant_id);
CREATE INDEX idx_gamification_profiles_customer ON gamification_profiles(customer_id);

-- REWARDS
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('discount', 'freebie', 'cashback', 'exclusive')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
CREATE INDEX idx_rewards_tenant ON rewards(tenant_id);
CREATE INDEX idx_rewards_status ON rewards(status);

-- REWARD_REDEMPTIONS
CREATE TABLE reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    points_used INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    redeemed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reward_redemptions_tenant ON reward_redemptions(tenant_id);
CREATE INDEX idx_reward_redemptions_customer ON reward_redemptions(customer_id);
CREATE INDEX idx_reward_redemptions_reward ON reward_redemptions(reward_id);

-- GAMIFICATION_POINTS
CREATE TABLE gamification_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_type VARCHAR(50), -- 'feedback', 'visit', 'purchase', 'referral', 'event'
    reference_id UUID,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_gamification_points_tenant ON gamification_points(tenant_id);
CREATE INDEX idx_gamification_points_customer ON gamification_points(customer_id);
CREATE INDEX idx_gamification_points_reference ON gamification_points(reference_type, reference_id);

-- Add updated_at triggers
CREATE TRIGGER set_gamification_profiles_timestamp 
    BEFORE UPDATE ON gamification_profiles 
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_rewards_timestamp 
    BEFORE UPDATE ON rewards 
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_reward_redemptions_timestamp 
    BEFORE UPDATE ON reward_redemptions 
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Enable RLS
ALTER TABLE gamification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "gamification_profiles_isolation" ON gamification_profiles
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "rewards_isolation" ON rewards
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "reward_redemptions_isolation" ON reward_redemptions
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "gamification_points_isolation" ON gamification_points
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Function to redeem customer reward
CREATE OR REPLACE FUNCTION redeem_customer_reward(
    customer_id UUID,
    reward_id UUID,
    points_cost INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    customer_tenant_id UUID;
    reward_tenant_id UUID;
BEGIN
    -- Get tenant IDs
    SELECT tenant_id INTO customer_tenant_id 
    FROM gamification_profiles 
    WHERE customer_id = redeem_customer_reward.customer_id;
    
    SELECT tenant_id INTO reward_tenant_id 
    FROM rewards 
    WHERE id = redeem_customer_reward.reward_id;
    
    -- Check if customer and reward belong to the same tenant
    IF customer_tenant_id != reward_tenant_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check if customer has enough points
    IF (SELECT total_points FROM gamification_profiles WHERE customer_id = redeem_customer_reward.customer_id) < points_cost THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct points from customer profile
    UPDATE gamification_profiles 
    SET total_points = total_points - points_cost,
        updated_at = NOW()
    WHERE customer_id = redeem_customer_reward.customer_id;
    
    -- Record redemption
    INSERT INTO reward_redemptions (tenant_id, customer_id, reward_id, points_used)
    VALUES (customer_tenant_id, customer_id, reward_id, points_cost);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to award points to customer
CREATE OR REPLACE FUNCTION award_customer_points(
    customer_id UUID,
    points_amount INTEGER,
    reason_text VARCHAR(255),
    ref_type VARCHAR(50) DEFAULT NULL,
    ref_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    customer_tenant_id UUID;
BEGIN
    -- Get tenant ID
    SELECT tenant_id INTO customer_tenant_id 
    FROM gamification_profiles 
    WHERE customer_id = award_customer_points.customer_id;
    
    -- Award points to customer profile
    INSERT INTO gamification_profiles (id, tenant_id, customer_id, total_points)
    VALUES (gen_random_uuid(), customer_tenant_id, customer_id, points_amount)
    ON CONFLICT (customer_id) 
    DO UPDATE SET 
        total_points = gamification_profiles.total_points + award_customer_points.points_amount,
        updated_at = NOW();
    
    -- Record point transaction
    INSERT INTO gamification_points (tenant_id, customer_id, points, reason, reference_type, reference_id)
    VALUES (customer_tenant_id, customer_id, points_amount, reason_text, ref_type, ref_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;