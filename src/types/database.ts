// DigaZÉ - Database Types
// Auto-generated TypeScript types for Supabase database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database Enums
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  VIEWER = 'viewer'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid'
}

export enum PlanType {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  ENTERPRISE_PLUS = 'enterprise_plus'
}

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
  IN_APP = 'in_app'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum EventType {
  ENGAGEMENT_BOOST = 'engagement_boost',
  RECOVERY_CAMPAIGN = 'recovery_campaign',
  LIFECYCLE_CELEBRATION = 'lifecycle_celebration',
  FLASH_CAMPAIGN = 'flash_campaign',
  FEEDBACK_CHALLENGE = 'feedback_challenge'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  ARCHIVED = 'archived'
}

export enum FeedbackSentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative'
}

export enum FeedbackChannel {
  QRCODE = 'qrcode',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  WEBAPP = 'webapp',
  KIOSK = 'kiosk'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Database Tables
export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan_id: PlanType
          status: SubscriptionStatus
          price_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          start_date: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          plan_id: PlanType
          status?: SubscriptionStatus
          price_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          start_date?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          plan_id?: PlanType
          status?: SubscriptionStatus
          price_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          start_date?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      survey_templates: {
        Row: {
          id: string
          tenant_id: string | null
          name: string
          description: string | null
          category: string | null
          questions: Json
          is_public: boolean
          usage_count: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          name: string
          description?: string | null
          category?: string | null
          questions: Json
          is_public?: boolean
          usage_count?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          name?: string
          description?: string | null
          category?: string | null
          questions?: Json
          is_public?: boolean
          usage_count?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          subdomain: string
          settings: Json
          plan_id: PlanType
          subscription_status: SubscriptionStatus
          trial_ends_at: string | null
          subscription_ends_at: string | null
          branding: Json
          usage_limits: Json
          current_usage: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          email: string
          phone?: string | null
          address: Json
          plan_id?: PlanType
          subscription_status?: SubscriptionStatus
          trial_ends_at?: string | null
          subscription_ends_at?: string | null
          branding?: Json
          settings?: Json
          usage_limits: Json
          current_usage?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          email?: string
          phone?: string | null
          address?: Json
          plan_id?: PlanType
          subscription_status?: SubscriptionStatus
          trial_ends_at?: string | null
          subscription_ends_at?: string | null
          branding?: Json
          settings?: Json
          usage_limits?: Json
          current_usage?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          auth_id: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          role: UserRole
          permissions: Json
          managed_locations: string[] | null
          language: string | null
          timezone: string | null
          notification_preferences: Json
          is_active: boolean
          email_verified: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          auth_id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          permissions?: Json
          managed_locations?: string[] | null
          language?: string | null
          timezone?: string | null
          notification_preferences?: Json
          is_active?: boolean
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          auth_id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          role?: UserRole
          permissions?: Json
          managed_locations?: string[] | null
          language?: string | null
          timezone?: string | null
          notification_preferences?: Json
          is_active?: boolean
          email_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          tenant_id: string
          name: string
          slug: string
          address: Json
          coordinates: string | null
          manager_id: string | null
          business_hours: Json
          feedback_settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          slug: string
          address: Json
          coordinates?: string | null
          manager_id?: string | null
          business_hours?: Json
          feedback_settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          slug?: string
          address?: Json
          coordinates?: string | null
          manager_id?: string | null
          business_hours?: Json
          feedback_settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      feedbacks: {
        Row: {
          id: string
          location_id: string
          customer_data: Json | null
          customer_id: string | null
          responses: Json
          nps_score: number | null
          overall_rating: number | null
          sentiment: FeedbackSentiment | null
          sentiment_score: number | null
          keywords: string[] | null
          topics: string[] | null
          ai_summary: string | null
          channel: FeedbackChannel
          source_url: string | null
          device_info: Json | null
          status: FeedbackStatus
          assigned_to: string | null
          priority: Priority
          reviewed_at: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_id: string
          customer_data?: Json | null
          customer_id?: string | null
          responses: Json
          nps_score?: number | null
          overall_rating?: number | null
          sentiment?: FeedbackSentiment | null
          sentiment_score?: number | null
          keywords?: string[] | null
          topics?: string[] | null
          ai_summary?: string | null
          channel: FeedbackChannel
          source_url?: string | null
          device_info?: Json | null
          status?: FeedbackStatus
          assigned_to?: string | null
          priority?: Priority
          reviewed_at?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          customer_data?: Json | null
          customer_id?: string | null
          responses?: Json
          nps_score?: number | null
          overall_rating?: number | null
          sentiment?: FeedbackSentiment | null
          sentiment_score?: number | null
          keywords?: string[] | null
          topics?: string[] | null
          ai_summary?: string | null
          channel?: FeedbackChannel
          source_url?: string | null
          device_info?: Json | null
          status?: FeedbackStatus
          assigned_to?: string | null
          priority?: Priority
          reviewed_at?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          tenant_id: string
          type: EventType
          config: Json
          starts_at: string
          ends_at: string
          status: EventStatus
          metrics: Json
          created_by: string | null
          created_at: string
          updated_at: string
          name: string
          description: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description: string
          type: EventType
          config: Json
          starts_at: string
          ends_at: string
          status?: EventStatus
          metrics?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string
          type?: EventType
          config?: Json
          starts_at?: string
          ends_at?: string
          status?: EventStatus
          metrics?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          type: CampaignType
          content: Json
          template_id: string | null
          target_audience: Json
          estimated_reach: number | null
          schedule: Json | null
          send_at: string | null
          timezone: string | null
          status: CampaignStatus
          metrics: Json
          created_by: string | null
          created_at: string
          updated_at: string
          sent_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          type: CampaignType
          content: Json
          template_id?: string | null
          target_audience: Json
          estimated_reach?: number | null
          schedule?: Json | null
          send_at?: string | null
          timezone?: string | null
          status?: CampaignStatus
          metrics?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          sent_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          type?: CampaignType
          content?: Json
          template_id?: string | null
          target_audience?: Json
          estimated_reach?: number | null
          schedule?: Json | null
          send_at?: string | null
          timezone?: string | null
          status?: CampaignStatus
          metrics?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          sent_at?: string | null
          completed_at?: string | null
        }
      }
      customer_segments: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          criteria: Json
          member_count: number | null
          last_calculated_at: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          criteria: Json
          member_count?: number | null
          last_calculated_at?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          criteria?: Json
          member_count?: number | null
          last_calculated_at?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: UserRole
          invited_by: string
          token: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          role: UserRole
          invited_by: string
          token: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          role?: UserRole
          invited_by?: string
          token?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          tenant_id: string
          name: string
          key_hash: string
          key_prefix: string
          permissions: Json
          scopes: string[] | null
          rate_limit: number | null
          is_active: boolean
          expires_at: string | null
          last_used_at: string | null
          created_by: string | null
          created_at: string
          revoked_at: string | null
          revoked_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          key_hash: string
          key_prefix: string
          permissions?: Json
          scopes?: string[] | null
          rate_limit?: number | null
          is_active?: boolean
          expires_at?: string | null
          last_used_at?: string | null
          created_by?: string | null
          created_at?: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          permissions?: Json
          scopes?: string[] | null
          rate_limit?: number | null
          is_active?: boolean
          expires_at?: string | null
          last_used_at?: string | null
          created_by?: string | null
          created_at?: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json | null
          changes: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      daily_feedback_summary: {
        Row: {
          tenant_id: string
          location_id: string
          feedback_date: string
          total_feedbacks: number | null
          avg_nps: number | null
          avg_rating: number | null
          positive_count: number | null
          neutral_count: number | null
          negative_count: number | null
          promoters: number | null
          passives: number | null
          detractors: number | null
        }
      }
      tenant_statistics: {
        Row: {
          tenant_id: string | null
          total_users: number | null
          total_locations: number | null
          total_feedbacks: number | null
          feedbacks_this_month: number | null
          avg_nps_score: number | null
          avg_overall_rating: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      subscription_status: SubscriptionStatus
      plan_type: PlanType
      campaign_type: CampaignType
      campaign_status: CampaignStatus
      event_type: EventType
      event_status: EventStatus
      feedback_status: FeedbackStatus
      feedback_sentiment: FeedbackSentiment
      feedback_channel: FeedbackChannel
      priority: Priority
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tenant = Database['public']['Tables']['tenants']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Feedback = Database['public']['Tables']['feedbacks']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type CustomerSegment = Database['public']['Tables']['customer_segments']['Row']
export type Invitation = Database['public']['Tables']['invitations']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']

export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type FeedbackInsert = Database['public']['Tables']['feedbacks']['Insert']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
export type CustomerSegmentInsert = Database['public']['Tables']['customer_segments']['Insert']
export type InvitationInsert = Database['public']['Tables']['invitations']['Insert']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']

export type TenantUpdate = Database['public']['Tables']['tenants']['Update']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']
export type FeedbackUpdate = Database['public']['Tables']['feedbacks']['Update']
export type EventUpdate = Database['public']['Tables']['events']['Update']
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']
export type CustomerSegmentUpdate = Database['public']['Tables']['customer_segments']['Update']
export type InvitationUpdate = Database['public']['Tables']['invitations']['Update']
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update']
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']

// Added exports for new tables
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type SurveyTemplate = Database['public']['Tables']['survey_templates']['Row']
export type SurveyTemplateInsert = Database['public']['Tables']['survey_templates']['Insert']
export type SurveyTemplateUpdate = Database['public']['Tables']['survey_templates']['Update']