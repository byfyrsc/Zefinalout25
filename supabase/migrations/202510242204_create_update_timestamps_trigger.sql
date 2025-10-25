-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tenants table
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to locations table
CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to feedbacks table
CREATE TRIGGER update_feedbacks_updated_at
BEFORE UPDATE ON feedbacks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to campaigns table
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to events table
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to customer_segments table
CREATE TRIGGER update_customer_segments_updated_at
BEFORE UPDATE ON customer_segments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to api_keys table
CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();