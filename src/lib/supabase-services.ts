// DigaZÉ - Supabase Services
// Helper functions for database operations

import { supabase } from './supabase'
import type {
  Tenant,
  User,
  Location,
  Feedback,
  Event,
  Campaign,
  Subscription,
  CustomerSegment,
  SurveyTemplate,
  TenantInsert,
  UserInsert,
  LocationInsert,
  FeedbackInsert,
  EventInsert,
  CampaignInsert,
  SubscriptionInsert,
  CustomerSegmentInsert,
  SurveyTemplateInsert,
  TenantUpdate,
  UserUpdate,
  LocationUpdate,
  FeedbackUpdate,
  EventUpdate,
  CampaignUpdate,
  SubscriptionUpdate,
  CustomerSegmentUpdate,
  SurveyTemplateUpdate
} from '../types/database'

// Tenant Services
export const tenantService = {
  async getCurrent(): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .single()
    
    if (error) {
      console.error('Error fetching current tenant:', error)
      return null
    }
    
    return data
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching tenant:', error)
      return null
    }
    
    return data
  },

  async create(tenant: TenantInsert): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating tenant:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: TenantUpdate): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating tenant:', error)
      return null
    }
    
    return data
  }
}

// User Services
export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching user:', error)
      return null
    }
    
    return data
  },

  async create(user: UserInsert): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      return null
    }
    
    return data
  }
}

// Location Services
export const locationService = {
  async getAll(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching locations:', error)
      return []
    }
    
    return data || []
  },

  // New method to get all locations for a specific tenant
  async getAllByTenant(tenantId: string): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching locations for tenant:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching location:', error)
      return null
    }
    
    return data
  },

  async create(location: LocationInsert): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating location:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: LocationUpdate): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating location:', error)
      return null
    }
    
    return data
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting location:', error)
      return false
    }
    
    return true
  }
}

// Feedback Services
export const feedbackService = {
  async getAll(locationId?: string): Promise<Feedback[]> {
    let query = supabase
      .from('feedbacks')
      .select(`
        *,
        location:locations(name),
        assigned_user:users(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (locationId) {
      query = query.eq('location_id', locationId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching feedbacks:', error)
      return []
    }
    
    return data || []
  },

  async getById(id: string): Promise<Feedback | null> {
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`
        *,
        location:locations(name),
        assigned_user:users(first_name, last_name, email)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching feedback:', error)
      return null
    }
    
    return data
  },

  async create(feedback: FeedbackInsert): Promise<Feedback | null> {
    const { data, error } = await supabase
      .from('feedbacks')
      .insert(feedback)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating feedback:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: FeedbackUpdate): Promise<Feedback | null> {
    const { data, error } = await supabase
      .from('feedbacks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating feedback:', error)
      return null
    }
    
    return data
  },

  async getAnalytics(locationId?: string, dateRange?: { start: string; end: string }) {
    let query = supabase
      .from('feedbacks')
      .select('nps_score, sentiment, overall_rating, created_at')
    
    if (locationId) {
      query = query.eq('location_id', locationId)
    }
    
    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching feedback analytics:', error)
      return null
    }
    
    // Calculate analytics
    const totalFeedbacks = data?.length || 0
    const npsScores = data?.filter(f => f.nps_score !== null).map(f => f.nps_score!) || []
    const ratings = data?.filter(f => f.overall_rating !== null).map(f => f.overall_rating!) || []
    
    const promoters = npsScores.filter(score => score >= 9).length
    const detractors = npsScores.filter(score => score <= 6).length
    const npsScore = npsScores.length > 0 ? Math.round(((promoters - detractors) / npsScores.length) * 100) : 0
    
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
    
    const sentimentCounts = {
      positive: data?.filter(f => f.sentiment === 'positive').length || 0,
      neutral: data?.filter(f => f.sentiment === 'neutral').length || 0,
      negative: data?.filter(f => f.sentiment === 'negative').length || 0
    }
    
    return {
      totalFeedbacks,
      npsScore,
      averageRating: Math.round(averageRating * 100) / 100,
      sentimentCounts,
      promoters,
      detractors,
      passives: npsScores.length - promoters - detractors
    }
  }
}

// Event Services
export const eventService = {
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching events:', error)
      return []
    }
    
    return data || []
  },

  async getActive(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching active events:', error)
      return []
    }
    
    return data || []
  },

  async create(event: EventInsert): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating event:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: EventUpdate): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating event:', error)
      return null
    }
    
    return data
  }
}

// Campaign Services
export const campaignService = {
  async getAll(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching campaigns:', error)
      return []
    }
    
    return data || []
  },

  async create(campaign: CampaignInsert): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating campaign:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: CampaignUpdate): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating campaign:', error)
      return null
    }
    
    return data
  }
}

// Subscription Services
export const subscriptionService = {
  async getCurrent(): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .single()
    
    if (error) {
      console.error('Error fetching current subscription:', error)
      return null
    }
    
    return data
  },

  async create(subscription: SubscriptionInsert): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating subscription:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: SubscriptionUpdate): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating subscription:', error)
      return null
    }
    
    return data
  }
}

// Survey Template Services
export const surveyTemplateService = {
  async getAll(): Promise<SurveyTemplate[]> {
    const { data, error } = await supabase
      .from('survey_templates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching survey templates:', error)
      return []
    }
    
    return data || []
  },

  async getPublic(): Promise<SurveyTemplate[]> {
    const { data, error } = await supabase
      .from('survey_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false })
    
    if (error) {
      console.error('Error fetching public survey templates:', error)
      return []
    }
    
    return data || []
  },

  async create(template: SurveyTemplateInsert): Promise<SurveyTemplate | null> {
    const { data, error } = await supabase
      .from('survey_templates')
      .insert(template)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating survey template:', error)
      return null
    }
    
    return data
  },

  async update(id: string, updates: SurveyTemplateUpdate): Promise<SurveyTemplate | null> {
    const { data, error } = await supabase
      .from('survey_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating survey template:', error)
      return null
    }
    
    return data
  }
}