# DigaZé - Enhanced Database Schema

This document describes the enhanced database schema for the DigaZé platform, which includes performance improvements, analytics capabilities, and scalability enhancements.

## Overview

The enhanced schema builds upon the existing multi-tenant architecture and adds several new features to improve performance, analytics, and user experience.

## New Tables

### 1. Enhanced Audit Logs (`audit_logs_enhanced`)

An improved version of the audit logging system with more detailed tracking capabilities.

**Columns:**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key to tenants)
- `user_id` (UUID, Foreign Key to users)
- `action` (VARCHAR) - The action performed
- `resource_type` (VARCHAR) - The type of resource affected
- `resource_id` (UUID) - The ID of the resource affected
- `old_values` (JSONB) - The previous values of the resource
- `new_values` (JSONB) - The new values of the resource
- `details` (JSONB) - Additional details about the action
- `ip_address` (INET) - The IP address of the user
- `user_agent` (TEXT) - The user agent of the request
- `created_at` (TIMESTAMP WITH TIME ZONE)

### 2. Notifications (`notifications`)

A notification system to keep users informed about important events.

**Columns:**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key to tenants)
- `user_id` (UUID, Foreign Key to users)
- `type` (VARCHAR) - The type of notification (e.g., 'feedback_received', 'campaign_sent')
- `title` (VARCHAR) - The title of the notification
- `message` (TEXT) - The message content
- `data` (JSONB) - Additional data related to the notification
- `is_read` (BOOLEAN) - Whether the notification has been read
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `read_at` (TIMESTAMP WITH TIME ZONE)

### 3. Segment Criteria (`segment_criteria`)

Enhanced customer segmentation with detailed criteria.

**Columns:**
- `id` (UUID, Primary Key)
- `segment_id` (UUID, Foreign Key to customer_segments)
- `field_name` (VARCHAR) - The field to evaluate
- `operator` (VARCHAR) - The comparison operator (e.g., 'equals', 'contains')
- `value` (TEXT) - The value to compare against
- `created_at` (TIMESTAMP WITH TIME ZONE)

### 4. Feedback Questions (`feedback_questions`)

Normalized feedback questions for better analytics.

**Columns:**
- `id` (UUID, Primary Key)
- `tenant_id` (UUID, Foreign Key to tenants)
- `question_text` (TEXT) - The question text
- `question_type` (VARCHAR) - The type of question (e.g., 'rating', 'text')
- `options` (JSONB) - Options for multiple choice questions
- `created_at` (TIMESTAMP WITH TIME ZONE)

### 5. Feedback Responses (`feedback_responses`)

Normalized feedback responses linked to questions.

**Columns:**
- `id` (UUID, Primary Key)
- `feedback_id` (UUID, Foreign Key to feedbacks)
- `question_id` (UUID, Foreign Key to feedback_questions)
- `response_value` (TEXT) - Text response value
- `response_numeric` (DECIMAL) - Numeric response value
- `created_at` (TIMESTAMP WITH TIME ZONE)

## New Indexes

Several new indexes have been added to improve query performance:

1. `idx_users_permissions` - GIN index on users.permissions
2. `idx_feedbacks_responses` - GIN index on feedbacks.responses
3. `idx_feedbacks_keywords` - GIN index on feedbacks.keywords
4. `idx_campaigns_metrics` - GIN index on campaigns.metrics
5. `idx_events_metrics` - GIN index on events.metrics
6. `idx_feedbacks_location_created` - Composite index on feedbacks(location_id, created_at)
7. `idx_users_tenant_role` - Composite index on users(tenant_id, role)

## Materialized Views

### Daily Feedback Summary

A materialized view that aggregates daily feedback statistics for faster dashboard loading:

```sql
CREATE MATERIALIZED VIEW daily_feedback_summary AS
SELECT 
    l.tenant_id,
    f.location_id,
    l.name as location_name,
    DATE(f.created_at) as feedback_date,
    COUNT(*) as total_feedbacks,
    AVG(f.overall_rating) as avg_rating,
    AVG(f.nps_score) as avg_nps,
    COUNT(CASE WHEN f.sentiment = 'positive' THEN 1 END) as positive_count,
    COUNT(CASE WHEN f.sentiment = 'neutral' THEN 1 END) as neutral_count,
    COUNT(CASE WHEN f.sentiment = 'negative' THEN 1 END) as negative_count
FROM feedbacks f
JOIN locations l ON f.location_id = l.id
GROUP BY l.tenant_id, f.location_id, l.name, DATE(f.created_at);
```

## New Functions

### 1. Tenant Usage Statistics

```sql
get_tenant_usage(tenant_uuid UUID)
```

Returns usage statistics for a tenant including feedback count, location count, user count, etc.

### 2. Tenant Analytics Summary

```sql
get_tenant_analytics_summary(tenant_uuid UUID)
```

Returns a comprehensive analytics summary for a tenant including NPS scores, ratings, sentiment distribution, etc.

### 3. Refresh Daily Feedback Summary

```sql
refresh_daily_feedback_summary()
```

Refreshes the daily feedback summary materialized view.

### 4. Cleanup Old Notifications

```sql
cleanup_old_notifications()
```

Deletes notifications older than 90 days.

### 5. Update Campaign Metrics

```sql
update_campaign_metrics(campaign_id UUID)
```

Updates campaign metrics based on engagement data.

## Enhanced Columns

### Tenants Table

- `feedback_count` (INTEGER) - The number of feedbacks for the tenant
- `last_feedback_at` (TIMESTAMP WITH TIME ZONE) - The timestamp of the last feedback

### Campaigns Table

- `open_rate_trend` (DECIMAL[]) - Trend data for open rates
- `click_rate_trend` (DECIMAL[]) - Trend data for click rates
- `conversion_rate_trend` (DECIMAL[]) - Trend data for conversion rates

### Users Table

- `last_activity_at` (TIMESTAMP WITH TIME ZONE) - The timestamp of the user's last activity

## Row Level Security (RLS) Policies

RLS policies have been implemented for all new tables to ensure data isolation between tenants:

1. **audit_logs_enhanced** - Only admins can view logs for their tenant
2. **notifications** - Users can view their own notifications; admins can manage all notifications for their tenant
3. **segment_criteria** - Users can view criteria for segments in their tenant; managers can manage them
4. **feedback_questions** - Users can view questions in their tenant; staff can manage them
5. **feedback_responses** - Users can view responses for their tenant; staff can manage them

## Triggers

### Tenant Statistics Update

A trigger updates tenant statistics (feedback count, last feedback timestamp) when feedback is added or removed.

## Frontend Components

### 1. Notifications Panel

A React component that displays notifications and allows users to mark them as read or delete them.

### 2. Analytics Dashboard

A React component that displays analytics using the materialized view and RPC functions.

## Services

### Enhanced Supabase Services

A new service file (`supabase-enhanced-services.ts`) provides helper functions for interacting with the new tables:

1. **notificationService** - Manage notifications
2. **segmentCriteriaService** - Manage segment criteria
3. **feedbackQuestionService** - Manage feedback questions
4. **feedbackResponseService** - Manage feedback responses
5. **analyticsService** - Retrieve analytics data
6. **maintenanceService** - Perform maintenance operations

## Hooks

### useNotifications

A React hook that provides functions for managing notifications in the frontend.

## Migration Files

The enhancements are implemented through migration files:

1. `004_enhanced_schema.sql` - Creates new tables, indexes, and functions
2. `005_rls_enhanced_schema.sql` - Implements RLS policies for new tables
3. `006_functions_triggers.sql` - Creates additional functions and triggers

## Benefits

1. **Improved Performance** - New indexes and materialized views significantly improve query performance
2. **Better Analytics** - Enhanced analytics capabilities with normalized feedback data
3. **User Engagement** - Notification system keeps users informed about important events
4. **Scalability** - Design supports horizontal scaling and large data volumes
5. **Maintainability** - Well-organized schema with clear relationships between entities