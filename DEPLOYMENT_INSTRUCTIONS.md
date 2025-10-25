# DigaZé - Deployment Instructions for Enhanced Schema

## Overview

This document provides step-by-step instructions for deploying the enhanced database schema to your Supabase instance.

## Prerequisites

1. Supabase CLI installed
2. Access to your Supabase project
3. Environment variables configured in `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Deployment Steps

### 1. Apply Database Migrations

Navigate to your project directory and apply the migrations in order:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Apply the enhanced schema migration
supabase migration up 004_enhanced_schema.sql

# Apply the RLS policies for enhanced schema
supabase migration up 005_rls_enhanced_schema.sql

# Apply the functions and triggers migration
supabase migration up 006_functions_triggers.sql
```

Alternatively, you can apply all migrations at once:

```bash
supabase migration up
```

### 2. Verify Migration Success

Check that all tables, indexes, views, functions, and policies were created successfully:

```bash
# List all tables
supabase db table list

# List all functions
supabase db function list

# Check RLS policies
supabase db policy list
```

### 3. Update TypeScript Types

The enhanced database types are already defined in `src/types/enhanced-database.ts`. Make sure your application references these types when interacting with the new tables.

### 4. Deploy Frontend Components

The new frontend components are ready to be integrated into your application:

1. `src/components/NotificationsPanel.tsx` - Notification management panel
2. `src/components/AnalyticsDashboard.tsx` - Analytics dashboard with charts
3. `src/hooks/useNotifications.ts` - Custom hook for notification management

Import and use these components in your application as needed.

### 5. Update Service Layer

The enhanced Supabase services are implemented in `src/lib/supabase-enhanced-services.ts`. You can import and use these services in your application:

```typescript
import { notificationService, analyticsService } from '@/lib/supabase-enhanced-services'
```

### 6. Test the Deployment

Run the integration test to verify that all components work together:

```bash
node scripts/integration-test.mjs
```

### 7. Monitor Performance

After deployment, monitor your application's performance to ensure the enhancements are providing the expected benefits:

1. Check query performance improvements
2. Verify that analytics dashboards load faster
3. Confirm that notifications are working correctly
4. Monitor resource usage

## Rollback Plan

If you need to rollback the changes:

```bash
# Rollback the last migration
supabase migration down

# Or rollback to a specific migration
supabase migration down 003_create_admin_user.sql
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

### 3. Update Documentation

Update your internal documentation to reflect the new schema and features.

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

## Verification Checklist

Before going live, verify that:

- [ ] All migrations applied successfully
- [ ] New tables created with correct columns
- [ ] Indexes created on new tables
- [ ] Materialized views created and populated
- [ ] Functions and triggers working correctly
- [ ] RLS policies applied to new tables
- [ ] Frontend components integrated and functional
- [ ] Services layer updated and working
- [ ] Integration tests passing
- [ ] Performance improvements observed

## Conclusion

The enhanced schema provides significant improvements to the DigaZé platform in terms of performance, analytics, and user engagement. Follow these deployment instructions carefully to ensure a smooth transition to the enhanced schema.