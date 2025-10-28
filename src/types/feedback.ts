// Survey and Feedback System Types

export type QuestionType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'rating'
  | 'nps'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'date'
  | 'email'
  | 'phone'
  | 'file_upload'
  | 'matrix'
  | 'slider';

export type DistributionChannel = 
  | 'qr_code'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'web_link'
  | 'embedded'
  | 'social_media';

export type SentimentScore = 'positive' | 'neutral' | 'negative';

export type NPSCategory = 'detractor' | 'passive' | 'promoter';

// Question Logic and Conditions
export interface QuestionCondition {
  id: string;
  question_id: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string | number | boolean;
  action: 'show' | 'hide' | 'jump_to' | 'end_survey';
  target_question_id?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string | number;
  image_url?: string;
  is_other?: boolean;
}

export interface QuestionValidation {
  required: boolean;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  custom_message?: string;
}

// Survey Question Structure
export interface SurveyQuestion {
  id: string;
  survey_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  placeholder?: string;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  conditions?: QuestionCondition[];
  order: number;
  is_required: boolean;
  settings: {
    randomize_options?: boolean;
    allow_multiple?: boolean;
    scale_min?: number;
    scale_max?: number;
    scale_labels?: { min: string; max: string };
    matrix_rows?: string[];
    matrix_columns?: string[];
  };
  created_at: string;
  updated_at: string;
}

// Survey Template and Configuration
export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: 'nps' | 'satisfaction' | 'feedback' | 'custom' | 'onboarding' | 'exit';
  industry: string[];
  questions: Omit<SurveyQuestion, 'id' | 'survey_id' | 'created_at' | 'updated_at'>[];
  estimated_time: number; // in minutes
  tags: string[];
  is_premium: boolean;
  created_at: string;
}

export interface SurveySettings {
  welcome_screen: {
    enabled: boolean;
    title?: string;
    description?: string;
    image_url?: string;
  };
  thank_you_screen: {
    enabled: boolean;
    title?: string;
    description?: string;
    redirect_url?: string;
  };
  progress_bar: boolean;
  question_numbering: boolean;
  randomize_questions: boolean;
  allow_back_navigation: boolean;
  auto_save: boolean;
  response_limit?: number;
  expiry_date?: string;
  password_protection?: string;
  custom_css?: string;
  branding: {
    logo_url?: string;
    primary_color?: string;
    background_color?: string;
    font_family?: string;
  };
}

// Main Survey Structure
export interface Survey {
  id: string;
  tenant_id: string;
  location_id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  template_id?: string;
  questions: SurveyQuestion[];
  settings: SurveySettings;
  distribution: {
    channels: DistributionChannel[];
    qr_code_url?: string;
    public_url?: string;
    embed_code?: string;
  };
  analytics: {
    total_responses: number;
    completion_rate: number;
    average_time: number;
    nps_score?: number;
    sentiment_breakdown: Record<SentimentScore, number>;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Response and Answer Types
export interface SurveyAnswer {
  id: string;
  response_id: string;
  question_id: string;
  question_type: QuestionType;
  value: string | number | boolean | string[] | number[];
  text_value?: string;
  numeric_value?: number;
  option_ids?: string[];
  file_urls?: string[];
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  tenant_id: string;
  location_id?: string;
  customer_data?: {
    email?: string;
    phone?: string;
    name?: string;
    external_id?: string;
    metadata?: Record<string, any>;
  };
  answers: SurveyAnswer[];
  status: 'in_progress' | 'completed' | 'abandoned';
  completion_percentage: number;
  time_spent: number; // in seconds
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  nps_score?: number;
  nps_category?: NPSCategory;
  sentiment_score?: SentimentScore;
  sentiment_confidence?: number;
  ai_insights?: {
    summary: string;
    key_themes: string[];
    emotion_analysis: Record<string, number>;
    action_items: string[];
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// NPS and Analytics
export interface NPSMetrics {
  id: string;
  tenant_id: string;
  location_id?: string;
  survey_id?: string;
  period_start: string;
  period_end: string;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  nps_score: number;
  previous_nps_score?: number;
  trend: 'up' | 'down' | 'stable';
  benchmark_score?: number;
  industry_average?: number;
  segments: {
    segment_name: string;
    segment_value: string;
    nps_score: number;
    response_count: number;
  }[];
  created_at: string;
}

export interface FeedbackInsight {
  id: string;
  tenant_id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  data_points: {
    metric: string;
    value: number;
    change: number;
    period: string;
  }[];
  action_items: string[];
  affected_locations?: string[];
  affected_segments?: string[];
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

// Distribution and Campaign Types
export interface FeedbackCampaign {
  id: string;
  tenant_id: string;
  survey_id: string;
  name: string;
  description?: string;
  channels: DistributionChannel[];
  target_audience: {
    segments?: string[];
    locations?: string[];
    customer_tags?: string[];
    filters?: Record<string, any>;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring' | 'triggered';
    start_date?: string;
    end_date?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    trigger_events?: string[];
  };
  content: {
    subject?: string;
    message?: string;
    call_to_action?: string;
    personalization?: Record<string, string>;
  };
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    responded: number;
    conversion_rate: number;
  };
  created_at: string;
  updated_at: string;
}

// Recovery and Follow-up
export interface FeedbackRecoveryWorkflow {
  id: string;
  tenant_id: string;
  name: string;
  trigger_conditions: {
    nps_threshold?: number;
    sentiment_threshold?: SentimentScore;
    keywords?: string[];
    response_time?: number;
  };
  actions: {
    type: 'email' | 'sms' | 'call' | 'task' | 'escalation';
    delay: number; // in minutes
    content: {
      template_id?: string;
      subject?: string;
      message?: string;
      assignee?: string;
    };
    conditions?: Record<string, any>;
  }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface CreateSurveyRequest {
  title: string;
  description?: string;
  template_id?: string;
  location_id?: string;
  questions?: Omit<SurveyQuestion, 'id' | 'survey_id' | 'created_at' | 'updated_at'>[];
  settings?: Partial<SurveySettings>;
}

export interface UpdateSurveyRequest {
  title?: string;
  description?: string;
  questions?: SurveyQuestion[];
  settings?: Partial<SurveySettings>;
  status?: Survey['status'];
}

export interface SubmitResponseRequest {
  survey_id: string;
  answers: Omit<SurveyAnswer, 'id' | 'response_id' | 'created_at'>[];
  customer_data?: SurveyResponse['customer_data'];
  metadata?: Record<string, any>;
}

export interface FeedbackAnalyticsRequest {
  tenant_id: string;
  location_ids?: string[];
  survey_ids?: string[];
  date_from?: string;
  date_to?: string;
  segment_by?: 'location' | 'survey' | 'time' | 'customer_segment';
  metrics?: ('nps' | 'sentiment' | 'completion_rate' | 'response_volume')[];
}

export interface FeedbackAnalyticsResponse {
  summary: {
    total_responses: number;
    average_nps: number;
    sentiment_breakdown: Record<SentimentScore, number>;
    completion_rate: number;
    response_trend: { date: string; count: number }[];
  };
  segments: {
    segment_name: string;
    segment_value: string;
    metrics: Record<string, number>;
  }[];
  insights: FeedbackInsight[];
  benchmarks: {
    industry_nps: number;
    industry_sentiment: Record<SentimentScore, number>;
    peer_comparison: Record<string, number>;
  };
}

// Real-time Events
export interface FeedbackEvent {
  id: string;
  type: 'response_received' | 'nps_alert' | 'sentiment_alert' | 'milestone_reached' | 'workflow_triggered';
  tenant_id: string;
  survey_id?: string;
  response_id?: string;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
}

// Survey Builder Types
export interface SurveyBuilderState {
  survey: Partial<Survey>;
  current_question_index: number;
  is_preview_mode: boolean;
  unsaved_changes: boolean;
  validation_errors: Record<string, string[]>;
}

export interface DragDropQuestion {
  id: string;
  type: QuestionType;
  title: string;
  isNew: boolean;
  position: { x: number; y: number };
}