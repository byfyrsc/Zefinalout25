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
export type UserRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
export type PlanType = 'starter' | 'professional' | 'enterprise' | 'enterprise_plus'
export type CampaignType = 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app'
export type EventType = 'engagement_boost' | 'recovery_campaign' | 'lifecycle_celebration' | 'flash_campaign' | 'feedback_challenge'
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative'

// Database Tables
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          subdomain: string
          settings: Json
          plan_id: PlanType
          created_at: string
          updated_at: string
          stripe_customer_id: string | null
          trial_ends_at: string | null
          branding: Json
          monthly_feedback_limit: number
          location_limit: number
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          settings?: Json
          plan_id?: PlanType
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          branding?: Json
          monthly_feedback_limit?: number
          location_limit?: number
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          settings?: Json
          plan_id?: PlanType
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          branding?: Json
          monthly_feedback_limit?: number
          location_limit?: number
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: UserRole
          permissions: Json
          profile_data: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          preferences: Json
          is_active: boolean
          email_verified: boolean
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          role?: UserRole
          permissions?: Json
          profile_data?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json
          is_active?: boolean
          email_verified?: boolean
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          role?: UserRole
          permissions?: Json
          profile_data?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          preferences?: Json
          is_active?: boolean
          email_verified?: boolean
        }
      }
      locations: {
        Row: {
          id: string
          tenant_id: string
          name: string
          address: string | null
          settings: Json
          manager_id: string | null
          created_at: string
          updated_at: string
          phone: string | null
          email: string | null
          website: string | null
          latitude: number | null
          longitude: number | null
          timezone: string
          business_hours: Json
          is_active: boolean
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          address?: string | null
          settings?: Json
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string
          business_hours?: Json
          is_active?: boolean
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          address?: string | null
          settings?: Json
          manager_id?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string
          business_hours?: Json
          is_active?: boolean
        }
      }
      feedbacks: {
        Row: {
          id: string
          location_id: string
          customer_data: Json
          responses: Json
          sentiment: FeedbackSentiment | null
          nps_score: number | null
          created_at: string
          updated_at: string
          customer_email: string | null
          customer_phone: string | null
          customer_name: string | null
          source: string
          session_id: string | null
          user_agent: string | null
          ip_address: string | null
          ai_insights: Json
          keywords: string[] | null
          status: string
          assigned_to: string | null
          response_sent_at: string | null
          overall_rating: number | null
          food_rating: number | null
          service_rating: number | null
          ambiance_rating: number | null
          value_rating: number | null
        }
        Insert: {
          id?: string
          location_id: string
          customer_data?: Json
          responses: Json
          sentiment?: FeedbackSentiment | null
          nps_score?: number | null
          created_at?: string
          updated_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          source?: string
          session_id?: string | null
          user_agent?: string | null
          ip_address?: string | null
          ai_insights?: Json
          keywords?: string[] | null
          status?: string
          assigned_to?: string | null
          response_sent_at?: string | null
          overall_rating?: number | null
          food_rating?: number | null
          service_rating?: number | null
          ambiance_rating?: number | null
          value_rating?: number | null
        }
        Update: {
          id?: string
          location_id?: string
          customer_data?: Json
          responses?: Json
          sentiment?: FeedbackSentiment | null
          nps_score?: number | null
          created_at?: string
          updated_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          source?: string
          session_id?: string | null
          user_agent?: string | null
          ip_address?: string | null
          ai_insights?: Json
          keywords?: string[] | null
          status?: string
          assigned_to?: string | null
          response_sent_at?: string | null
          overall_rating?: number | null
          food_rating?: number | null
          service_rating?: number | null
          ambiance_rating?: number | null
          value_rating?: number | null
        }
      }
      events: {
        Row: {
          id: string
          tenant_id: string
          type: EventType
          config: Json
          status: string
          metrics: Json
          created_at: string
          updated_at: string
          name: string
          description: string | null
          starts_at: string | null
          ends_at: string | null
          target_locations: string[]
          target_segments: Json
          target_responses: number | null
          rewards: Json
          participants_count: number
          responses_count: number
          conversion_rate: number
        }
        Insert: {
          id?: string
          tenant_id: string
          type: EventType
          config?: Json
          status?: string
          metrics?: Json
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          starts_at?: string | null
          ends_at?: string | null
          target_locations?: string[]
          target_segments?: Json
          target_responses?: number | null
          rewards?: Json
          participants_count?: number
          responses_count?: number
          conversion_rate?: number
        }
        Update: {
          id?: string
          tenant_id?: string
          type?: EventType
          config?: Json
          status?: string
          metrics?: Json
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          starts_at?: string | null
          ends_at?: string | null
          target_locations?: string[]
          target_segments?: Json
          target_responses?: number | null
          rewards?: Json
          participants_count?: number
          responses_count?: number
          conversion_rate?: number
        }
      }
      campaigns: {
        Row: {
          id: string
          tenant_id: string
          type: CampaignType
          segments: Json
          content: Json
          schedule: Json
          metrics: Json
          created_at: string
          updated_at: string
          name: string
          description: string | null
          status: string
          scheduled_at: string | null
          sent_at: string | null
          target_locations: string[]
          target_audience: Json
          is_ab_test: boolean
          ab_test_config: Json
          recipients_count: number
          delivered_count: number
          opened_count: number
          clicked_count: number
          conversion_count: number
          delivery_rate: number
          open_rate: number
          click_rate: number
          conversion_rate: number
        }
        Insert: {
          id?: string
          tenant_id: string
          type: CampaignType
          segments?: Json
          content: Json
          schedule?: Json
          metrics?: Json
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          status?: string
          scheduled_at?: string | null
          sent_at?: string | null
          target_locations?: string[]
          target_audience?: Json
          is_ab_test?: boolean
          ab_test_config?: Json
          recipients_count?: number
          delivered_count?: number
          opened_count?: number
          clicked_count?: number
          conversion_count?: number
          delivery_rate?: number
          open_rate?: number
          click_rate?: number
          conversion_rate?: number
        }
        Update: {
          id?: string
          tenant_id?: string
          type?: CampaignType
          segments?: Json
          content?: Json
          schedule?: Json
          metrics?: Json
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          status?: string
          scheduled_at?: string | null
          sent_at?: string | null
          target_locations?: string[]
          target_audience?: Json
          is_ab_test?: boolean
          ab_test_config?: Json
          recipients_count?: number
          delivered_count?: number
          opened_count?: number
          clicked_count?: number
          conversion_count?: number
          delivery_rate?: number
          open_rate?: number
          click_rate?: number
          conversion_rate?: number
        }
      }
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          plan_id: PlanType
          status: SubscriptionStatus
          billing_data: Json
          created_at: string
          updated_at: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          amount: number | null
          currency: string
          usage_data: Json
          canceled_at: string | null
          cancel_at_period_end: boolean
          cancellation_reason: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          plan_id: PlanType
          status?: SubscriptionStatus
          billing_data?: Json
          created_at?: string
          updated_at?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          amount?: number | null
          currency?: string
          usage_data?: Json
          canceled_at?: string | null
          cancel_at_period_end?: boolean
          cancellation_reason?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          plan_id?: PlanType
          status?: SubscriptionStatus
          billing_data?: Json
          created_at?: string
          updated_at?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          amount?: number | null
          currency?: string
          usage_data?: Json
          canceled_at?: string | null
          cancel_at_period_end?: boolean
          cancellation_reason?: string | null
        }
      }
      customer_segments: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          criteria: Json
          created_at: string
          updated_at: string
          customer_count: number
          last_calculated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          criteria: Json
          created_at?: string
          updated_at?: string
          customer_count?: number
          last_calculated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          criteria?: Json
          created_at?: string
          updated_at?: string
          customer_count?: number
          last_calculated_at?: string | null
        }
      }
      survey_templates: {
        Row: {
          id: string
          tenant_id: string | null
          name: string
          description: string | null
          questions: Json
          settings: Json
          created_at: string
          updated_at: string
          category: string | null
          is_public: boolean
          usage_count: number
          version: number
          parent_template_id: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          name: string
          description?: string | null
          questions: Json
          settings?: Json
          created_at?: string
          updated_at?: string
          category?: string | null
          is_public?: boolean
          usage_count?: number
          version?: number
          parent_template_id?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          name?: string
          description?: string | null
          questions?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
          category?: string | null
          is_public?: boolean
          usage_count?: number
          version?: number
          parent_template_id?: string | null
        }
      }
      api_keys: {
        Row: {
          id: string
          tenant_id: string
          name: string
          key_hash: string
          permissions: Json
          created_at: string
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          key_hash: string
          permissions?: Json
          created_at?: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          key_hash?: string
          permissions?: Json
          created_at?: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          required_role: UserRole
        }
        Returns: boolean
      }
      belongs_to_tenant: {
        Args: {
          tenant_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      subscription_status: SubscriptionStatus
      plan_type: PlanType
      campaign_type: CampaignType
      event_type: EventType
      feedback_sentiment: FeedbackSentiment
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Feedback = Database['public']['Tables']['feedbacks']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type CustomerSegment = Database['public']['Tables']['customer_segments']['Row']
export type SurveyTemplate = Database['public']['Tables']['survey_templates']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// Insert types
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type FeedbackInsert = Database['public']['Tables']['feedbacks']['Insert']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type CustomerSegmentInsert = Database['public']['Tables']['customer_segments']['Insert']
export type SurveyTemplateInsert = Database['public']['Tables']['survey_templates']['Insert']
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

// Update types
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']
export type FeedbackUpdate = Database['public']['Tables']['feedbacks']['Update']
export type EventUpdate = Database['public']['Tables']['events']['Update']
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
export type CustomerSegmentUpdate = Database['public']['Tables']['customer_segments']['Update']
export type SurveyTemplateUpdate = Database['public']['Tables']['survey_templates']['Update']
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update']