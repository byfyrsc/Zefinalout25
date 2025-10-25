// DigaZÉ - Enhanced Database Types
// TypeScript types for the enhanced database schema

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs_enhanced: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          details: Json | null
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
          old_values?: Json | null
          new_values?: Json | null
          details?: Json | null
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
          old_values?: Json | null
          new_values?: Json | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          type: string
          title: string
          message: string | null
          data: Json | null
          is_read: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          type: string
          title: string
          message?: string | null
          data?: Json | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          type?: string
          title?: string
          message?: string | null
          data?: Json | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
      }
      segment_criteria: {
        Row: {
          id: string
          segment_id: string
          field_name: string
          operator: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          segment_id: string
          field_name: string
          operator: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          segment_id?: string
          field_name?: string
          operator?: string
          value?: string
          created_at?: string
        }
      }
      feedback_questions: {
        Row: {
          id: string
          tenant_id: string
          question_text: string
          question_type: string
          options: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          question_text: string
          question_type: string
          options?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          question_text?: string
          question_type?: string
          options?: Json | null
          created_at?: string
        }
      }
      feedback_responses: {
        Row: {
          id: string
          feedback_id: string
          question_id: string
          response_value: string | null
          response_numeric: number | null
          created_at: string
        }
        Insert: {
          id?: string
          feedback_id: string
          question_id: string
          response_value?: string | null
          response_numeric?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          feedback_id?: string
          question_id?: string
          response_value?: string | null
          response_numeric?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      daily_feedback_summary: {
        Row: {
          tenant_id: string | null
          location_id: string | null
          location_name: string | null
          feedback_date: string | null
          total_feedbacks: number | null
          avg_rating: number | null
          avg_nps: number | null
          positive_count: number | null
          neutral_count: number | null
          negative_count: number | null
        }
      }
    }
    Functions: {
      get_tenant_usage: {
        Args: {
          tenant_uuid: string
        }
        Returns: {
          feedback_count: number
          location_count: number
          user_count: number
          campaign_count: number
          event_count: number
        }
      }
      get_tenant_analytics_summary: {
        Args: {
          tenant_uuid: string
        }
        Returns: {
          total_feedbacks: number
          avg_nps_score: number
          avg_rating: number
          positive_sentiment_pct: number
          total_campaigns: number
          total_events: number
          active_users_count: number
        }
      }
      refresh_daily_feedback_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_campaign_metrics: {
        Args: {
          campaign_id: string
        }
        Returns: undefined
      }
      update_tenant_statistics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_last_activity: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
  }
}

// Type aliases for easier usage
export type AuditLogEnhanced = Database['public']['Tables']['audit_logs_enhanced']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type SegmentCriteria = Database['public']['Tables']['segment_criteria']['Row']
export type FeedbackQuestion = Database['public']['Tables']['feedback_questions']['Row']
export type FeedbackResponse = Database['public']['Tables']['feedback_responses']['Row']

// Insert types
export type AuditLogEnhancedInsert = Database['public']['Tables']['audit_logs_enhanced']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type SegmentCriteriaInsert = Database['public']['Tables']['segment_criteria']['Insert']
export type FeedbackQuestionInsert = Database['public']['Tables']['feedback_questions']['Insert']
export type FeedbackResponseInsert = Database['public']['Tables']['feedback_responses']['Insert']

// Update types
export type AuditLogEnhancedUpdate = Database['public']['Tables']['audit_logs_enhanced']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']
export type SegmentCriteriaUpdate = Database['public']['Tables']['segment_criteria']['Update']
export type FeedbackQuestionUpdate = Database['public']['Tables']['feedback_questions']['Update']
export type FeedbackResponseUpdate = Database['public']['Tables']['feedback_responses']['Update']