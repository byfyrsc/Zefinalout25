# DigaZé - Manual Deployment Guide

## Overview

This guide provides instructions for manually deploying the enhanced database schema to your Supabase instance when the CLI is not available or accessible.

## Prerequisites

1. Access to your Supabase project dashboard
2. Supabase project URL: `https://kgpstqohbhmquusacylj.supabase.co`
3. Service role key (obtain from Supabase dashboard)

## Deployment Steps

### Step 1: Apply Migration 004 - Enhanced Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Copy the contents of `supabase/migrations/004_enhanced_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

This migration will:
- Create new tables: `audit_logs_enhanced`, `notifications`, `segment_criteria`, `feedback_questions`, `feedback_responses`
- Add new indexes for improved query performance
- Create materialized view `daily_feedback_summary`
- Add helper functions for tenant usage statistics and analytics
- Enhance existing tables with new columns

### Step 2: Apply Migration 005 - RLS Enhanced Schema

1. In the same SQL Editor, clear the previous content
2. Copy the contents of `supabase/migrations/005_rls_enhanced_schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the migration

This migration will:
- Enable Row Level Security (RLS) on all new tables
- Create RLS policies for data isolation between tenants
- Define access controls for different user roles

### Step 3: Apply Migration 006 - Functions and Triggers

1. In the same SQL Editor, clear the previous content
2. Copy the contents of `supabase/migrations/006_functions_triggers.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the migration

This migration will:
- Create database functions for analytics and maintenance
- Implement triggers for automatic data updates
- Add functions for campaign metrics and tenant analytics

## Verification Steps

After applying all migrations, verify the deployment:

1. **Check Tables**: Navigate to **Table Editor** and confirm all new tables are present
2. **Check Functions**: Navigate to **Functions** and confirm all new functions are present
3. **Check Policies**: Navigate to **Policies** and confirm RLS policies are applied to new tables
4. **Test Queries**: Run sample queries to ensure the new tables and functions work correctly

## Testing the Deployment

Run the integration test to verify that all components work together:

```bash
node scripts/integration-test.mjs
```

## Post-Deployment Tasks

### 1. Refresh Materialized Views

After deployment, refresh the materialized views to populate them with data:

```sql
REFRESH MATERIALIZED VIEW daily_feedback_summary;
```

### 2. Set Up Scheduled Jobs

Set up scheduled jobs for maintenance functions:

1. `refresh_daily_feedback_summary()` - Should run daily
2. `cleanup_old_notifications()` - Should run weekly
3. `update_campaign_metrics()` - Should run after campaign completion

### 3. Update Frontend Components

Ensure the new frontend components are integrated:

1. `src/components/NotificationsPanel.tsx` - Notification management panel
2. `src/components/AnalyticsDashboard.tsx` - Analytics dashboard with charts
3. `src/hooks/useNotifications.ts` - Custom hook for notification management

### 4. Update Service Layer

Ensure the enhanced Supabase services are being used:

1. `src/lib/supabase-enhanced-services.ts` - Contains service functions for new database entities

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Verify that all RLS policies are correctly applied
   - Check that user roles and permissions are properly configured

2. **Function Execution Errors**
   - Ensure that all required extensions are enabled
   - Check function definitions for syntax errors

3. **Performance Issues**
   - Verify that indexes are properly created
   - Check query plans for optimization opportunities

### Support

If you encounter any issues during deployment, please contact the development team with:

1. Error messages
2. Steps taken before the error occurred
3. Database logs
4. Application logs

## Rollback Plan

If you need to rollback the changes:

1. **Drop New Tables**:
   ```sql
   DROP TABLE IF EXISTS feedback_responses, feedback_questions, segment_criteria, notifications, audit_logs_enhanced;
   ```

2. **Drop Materialized Views**:
   ```sql
   DROP MATERIALIZED VIEW IF EXISTS daily_feedback_summary;
   ```

3. **Remove Added Columns**:
   ```sql
   ALTER TABLE tenants DROP COLUMN IF EXISTS feedback_count, DROP COLUMN IF EXISTS last_feedback_at;
   ALTER TABLE campaigns DROP COLUMN IF EXISTS open_rate_trend, DROP COLUMN IF EXISTS click_rate_trend, DROP COLUMN IF EXISTS conversion_rate_trend;
   ALTER TABLE users DROP COLUMN IF EXISTS last_activity_at;
   ```

4. **Drop Functions**:
   ```sql
   DROP FUNCTION IF EXISTS refresh_daily_feedback_summary();
   DROP FUNCTION IF EXISTS get_tenant_usage(UUID);
   DROP FUNCTION IF EXISTS update_tenant_statistics();
   DROP FUNCTION IF EXISTS cleanup_old_notifications();
   DROP FUNCTION IF EXISTS update_campaign_metrics(UUID);
   DROP FUNCTION IF EXISTS get_tenant_analytics_summary(UUID);
   DROP FUNCTION IF EXISTS archive_old_feedbacks(INTEGER);
   DROP FUNCTION IF EXISTS update_user_last_activity();
   ```

## Conclusion

The enhanced schema provides significant improvements to the DigaZé platform in terms of performance, analytics, and user engagement. Follow these deployment instructions carefully to ensure a smooth transition to the enhanced schema.