import { SubscriptionPlan } from '@/lib/stripe';

export interface BillingInfo {
  id: string;
  tenant_id: string;
  plan_id: SubscriptionPlan;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  stripe_invoice_id: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  payment_intent_id?: string;
  due_date?: string;
  paid_at?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  stripe_payment_method_id: string;
  tenant_id: string;
  type: 'card' | 'pix' | 'boleto';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  tenant_id: string;
  metric_type: 'feedbacks' | 'locations' | 'campaigns' | 'sms_sent' | 'emails_sent';
  quantity: number;
  timestamp: string;
  billing_period: string;
}

export interface BillingMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churn_rate: number;
  ltv: number; // Customer Lifetime Value
  total_customers: number;
  active_subscriptions: number;
  trial_conversions: number;
  revenue_by_plan: Record<SubscriptionPlan, number>;
  growth_rate: number;
}

export interface PlanUsage {
  tenant_id: string;
  plan_id: SubscriptionPlan;
  current_period: {
    feedbacks_used: number;
    feedbacks_limit: number | 'unlimited';
    locations_used: number;
    locations_limit: number | 'unlimited';
    campaigns_used: number;
    campaigns_limit: number | 'unlimited';
    sms_sent: number;
    emails_sent: number;
  };
  overage_charges: {
    feedbacks: number;
    sms: number;
    emails: number;
  };
}

export interface SubscriptionChange {
  id: string;
  tenant_id: string;
  from_plan: SubscriptionPlan;
  to_plan: SubscriptionPlan;
  change_type: 'upgrade' | 'downgrade' | 'cancel';
  effective_date: string;
  proration_amount?: number;
  reason?: string;
  created_at: string;
}

export interface DunningAttempt {
  id: string;
  tenant_id: string;
  invoice_id: string;
  attempt_number: number;
  method: 'email' | 'sms' | 'phone' | 'suspension';
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  scheduled_at: string;
  executed_at?: string;
  next_attempt_at?: string;
}

export interface BillingEvent {
  id: string;
  tenant_id: string;
  event_type: 'subscription_created' | 'subscription_updated' | 'subscription_canceled' | 
              'invoice_created' | 'invoice_paid' | 'invoice_failed' | 'payment_method_added' |
              'payment_method_removed' | 'trial_started' | 'trial_ended' | 'plan_changed';
  stripe_event_id?: string;
  data: Record<string, any>;
  processed: boolean;
  created_at: string;
}

export interface CheckoutSession {
  id: string;
  tenant_id: string;
  stripe_session_id: string;
  plan_id: SubscriptionPlan;
  mode: 'subscription' | 'payment';
  status: 'open' | 'complete' | 'expired';
  success_url: string;
  cancel_url: string;
  customer_email?: string;
  trial_period_days?: number;
  created_at: string;
}

// API Request/Response types
export interface CreateCheckoutSessionRequest {
  plan_id: SubscriptionPlan;
  success_url?: string;
  cancel_url?: string;
  trial_period_days?: number;
  customer_email?: string;
}

export interface CreateCheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface UpdateSubscriptionRequest {
  plan_id: SubscriptionPlan;
  proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
}

export interface CancelSubscriptionRequest {
  cancel_at_period_end: boolean;
  reason?: string;
}

export interface AddPaymentMethodRequest {
  payment_method_id: string;
  set_as_default?: boolean;
}

export interface BillingPortalRequest {
  return_url?: string;
}

export interface BillingPortalResponse {
  url: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key?: