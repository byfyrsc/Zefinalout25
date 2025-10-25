// DigaZÉ - Enhanced Supabase Services
// Helper functions for the enhanced database operations

import { supabase } from './supabase'
import type {
  Notification,
  SegmentCriteria,
  FeedbackQuestion,
  FeedbackResponse,
  NotificationInsert,
  SegmentCriteriaInsert,
  FeedbackQuestionInsert,
  FeedbackResponseInsert,
  NotificationUpdate,
  SegmentCriteriaUpdate,
  FeedbackQuestionUpdate,
  FeedbackResponseUpdate
} from '../types/enhanced-database'

// Notification Services
export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
    
    return data || []
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('is_read', false)
    
    if (error) {
      console.error('Error fetching unread notifications count:', error)
      return 0
    }
    
    return count || 0
  },

  async markAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
    
    return true
  },

  async markAllAsRead(): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false)
    
    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
    
    return true
  },

  async create(notification: NotificationInsert): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating notification:', error)
      return null
    }
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting notification:', error)
      return false
    }
    
    return true
  }
}

// Segment Criteria Services
export const segmentCriteriaService = {
  async getAllBySegment(segmentId: string): Promise<SegmentCriteria[]> {
    const { data, error } = await supabase
      .from('segment_criteria')
      .select('*')
      .eq('segment_id', segmentId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching segment criteria:', error)
      return []
    }
    
    return data || []
  },

  async create(criteria: SegmentCriteriaInsert): Promise<SegmentCriteria | null> {
    const { data, error } = await supabase
      .from('segment_criteria')
      .insert(criteria)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating segment criteria:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: SegmentCriteriaUpdate): Promise<SegmentCriteria | null> {
    const { data, error } = await supabase
      .from('segment_criteria')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating segment criteria:', error)
      return null
    }
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('segment_criteria')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting segment criteria:', error)
      return false
    }
    
    return true
  }
}

// Feedback Question Services
export const feedbackQuestionService = {
  async getAllByTenant(): Promise<FeedbackQuestion[]> {
    const { data, error } = await supabase
      .from('feedback_questions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching feedback questions:', error)
      return []
    }
    
    return data || []
  },

  async create(question: FeedbackQuestionInsert): Promise<FeedbackQuestion | null> {
    const { data, error } = await supabase
      .from('feedback_questions')
      .insert(question)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating feedback question:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: FeedbackQuestionUpdate): Promise<FeedbackQuestion | null> {
    const { data, error } = await supabase
      .from('feedback_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating feedback question:', error)
      return null
    }
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('feedback_questions')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting feedback question:', error)
      return false
    }
    
    return true
  }
}

// Feedback Response Services
export const feedbackResponseService = {
  async getAllByFeedback(feedbackId: string): Promise<FeedbackResponse[]> {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select(`
        *,
        question:feedback_questions(question_text, question_type)
      `)
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching feedback responses:', error)
      return []
    }
    
    return data || []
  },

  async create(response: FeedbackResponseInsert): Promise<FeedbackResponse | null> {
    const { data, error } = await supabase
      .from('feedback_responses')
      .insert(response)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating feedback response:', error)
      return null
    }
    
    return data
  },

  async batchCreate(responses: FeedbackResponseInsert[]): Promise<boolean> {
    const { error } = await supabase
      .from('feedback_responses')
      .insert(responses)
    
    if (error) {
      console.error('Error creating feedback responses:', error)
      return false
    }
    
    return true
  },

  async update(id: string, updates: FeedbackResponseUpdate): Promise<FeedbackResponse | null> {
    const { data, error } = await supabase
      .from('feedback_responses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating feedback response:', error)
      return null
    }
    
    return data
  }
}

// Analytics Services
export const analyticsService = {
  async getTenantUsage(tenantId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_tenant_usage', { tenant_uuid: tenantId })
    
    if (error) {
      console.error('Error fetching tenant usage:', error)
      return null
    }
    
    return data
  },

  async getTenantAnalyticsSummary(tenantId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_tenant_analytics_summary', { tenant_uuid: tenantId })
    
    if (error) {
      console.error('Error fetching tenant analytics summary:', error)
      return null
    }
    
    return data
  },

  async getDailyFeedbackSummary(): Promise<any[]> {
    const { data, error } = await supabase
      .from('daily_feedback_summary')
      .select('*')
      .order('feedback_date', { ascending: false })
      .limit(30) // Last 30 days
    
    if (error) {
      console.error('Error fetching daily feedback summary:', error)
      return []
    }
    
    return data || []
  }
}

// Maintenance Services
export const maintenanceService = {
  async refreshDailyFeedbackSummary(): Promise<boolean> {
    const { error } = await supabase
      .rpc('refresh_daily_feedback_summary')
    
    if (error) {
      console.error('Error refreshing daily feedback summary:', error)
      return false
    }
    
    return true
  },

  async cleanupOldNotifications(): Promise<boolean> {
    const { error } = await supabase
      .rpc('cleanup_old_notifications')
    
    if (error) {
      console.error('Error cleaning up old notifications:', error)
      return false
    }
    
    return true
  },

  async updateCampaignMetrics(campaignId: string): Promise<boolean> {
    const { error } = await supabase
      .rpc('update_campaign_metrics', { campaign_id: campaignId })
    
    if (error) {
      console.error('Error updating campaign metrics:', error)
      return false
    }
    
    return true
  }
}