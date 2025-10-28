# Gamification Implementation Plan

## Current Status

We have implemented the frontend components for customer gamification, events, and rewards, but the backend/database integration is not yet complete.

## Implemented Components

1. **Customer Gamification Dashboard** - Displays user points, badges, achievements, and leaderboard
2. **Customer Events Hub** - Shows available events and allows participation
3. **Customer Rewards Hub** - Manages reward redemption and history
4. **Customer Layout** - Mobile-friendly navigation for customer features
5. **Customer Routes** - Dedicated routes for customer gamification features
6. **Customer Gamification Service** - Service layer with mock data
7. **Customer Gamification Hook** - React hook for managing gamification state

## Missing Database Schema

The current database schema is missing several tables needed for full gamification functionality:

### 1. Gamification Profiles Table
```sql
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
```

### 2. Rewards Table
```sql
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
```

### 3. Reward Redemptions Table
```sql
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
```

### 4. Gamification Points Table
```sql
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
```

## Required Functions

### 1. Redeem Customer Reward Function
```sql
CREATE OR REPLACE FUNCTION redeem_customer_reward(
    customer_id UUID,
    reward_id UUID,
    points_cost INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
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
    SELECT 
        gp.tenant_id,
        redeem_customer_reward.customer_id,
        redeem_customer_reward.reward_id,
        points_cost
    FROM gamification_profiles gp
    WHERE gp.customer_id = redeem_customer_reward.customer_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

## Migration Steps

1. Add the missing tables to the database schema
2. Add Row Level Security (RLS) policies for the new tables
3. Add indexes for performance
4. Add triggers for automatic timestamp updates
5. Implement the required functions
6. Update the customer gamification service to use real database queries instead of mock data

## Future Enhancements

1. **Leaderboard System** - Implement materialized views for performance
2. **Achievement Tracking** - Add triggers to automatically award achievements
3. **Streak Management** - Add functions to track and reward streaks
4. **Social Features** - Add friend systems and social challenges
5. **Analytics Dashboard** - Create admin dashboard for gamification metrics