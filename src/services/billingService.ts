import { createStripeInstance, SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import type {
  BillingInfo,
  Invoice,
  PaymentMethod,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
  BillingPortalResponse,
  PlanUsage,
  BillingMetrics
} from '@/types/billing';

export class BillingService {
  private static getStripeInstance() {
    const secretKey = (typeof process !== 'undefined' && process.env.STRIPE_SECRET_KEY) || '';
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    return createStripeInstance(secretKey);
  }

  // Create Stripe customer
  static async createCustomer(tenantId: string, email: string, name?: string) {
    try {
      const stripe = this.getStripeInstance();
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          tenant_id: tenantId,
        },
      });

      // Update tenant with Stripe customer ID
      await supabase
        .from('tenants')
        .update({ stripe_customer_id: customer.id })
        .eq('id', tenantId);

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  // Create checkout session for subscription
  static async createCheckoutSession(
    tenantId: string,
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> {
    try {
      const { plan_id, success_url, cancel_url, trial_period_days = 14, customer_email } = request;
      
      const plan = SUBSCRIPTION_PLANS[plan_id];
      if (!plan || !plan.stripePriceId) {
        throw new Error(`Invalid plan or missing Stripe price ID for plan: ${plan_id}`);
      }

      // Get or create Stripe customer
      let customerId: string;
      const { data: tenant } = await supabase
        .from('tenants')
        .select('stripe_customer_id, name')
        .eq('id', tenantId)
        .single();

      if (tenant?.stripe_customer_id) {
        customerId = tenant.stripe_customer_id;
      } else {
        const customer = await this.createCustomer(
          tenantId,
          customer_email || 'noreply@example.com',
          tenant?.name
        );
        customerId = customer.id;
      }

      const stripe = this.getStripeInstance();
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: success_url || `${import.meta.env.VITE_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancel_url || `${import.meta.env.VITE_APP_URL}/billing/cancel`,
        subscription_data: {
          trial_period_days,
          metadata: {
            tenant_id: tenantId,
            plan_id,
          },
        },
        metadata: {
          tenant_id: tenantId,
          plan_id,
        },
      });

      // Store checkout session
      await supabase.from('checkout_sessions').insert({
        tenant_id: tenantId,
        stripe_session_id: session.id,
        plan_id,
        mode: 'subscription',
        status: 'open',
        success_url: session.success_url,
        cancel_url: session.cancel_url,
        trial_period_days,
      });

      return {
        session_id: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Get billing info for tenant
  static async getBillingInfo(tenantId: string): Promise<BillingInfo | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting billing info:', error);
      throw error;
    }
  }

  // Update subscription plan
  static async updateSubscription(
    tenantId: string,
    request: UpdateSubscriptionRequest
  ): Promise<void> {
    try {
      const billingInfo = await this.getBillingInfo(tenantId);
      if (!billingInfo) {
        throw new Error('No active subscription found');
      }

      const newPlan = SUBSCRIPTION_PLANS[request.plan_id];
      if (!newPlan.stripePriceId) {
        throw new Error(`Invalid plan: ${request.plan_id}`);
      }

      // Update Stripe subscription
      const stripe = this.getStripeInstance();
      const subscription = await stripe.subscriptions.retrieve(billingInfo.stripe_subscription_id);
      
      await stripe.subscriptions.update(billingInfo.stripe_subscription_id, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPlan.stripePriceId,
          },
        ],
        proration_behavior: request.proration_behavior || 'create_prorations',
      });

      // Update local database
      await supabase
        .from('subscriptions')
        .update({ plan_id: request.plan_id })
        .eq('id', billingInfo.id);

      // Log subscription change
      await supabase.from('subscription_changes').insert({
        tenant_id: tenantId,
        from_plan: billingInfo.plan_id,
        to_plan: request.plan_id,
        change_type: this.getChangeType(billingInfo.plan_id, request.plan_id),
        effective_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(
    tenantId: string,
    request: CancelSubscriptionRequest
  ): Promise<void> {
    try {
      const billingInfo = await this.getBillingInfo(tenantId);
      if (!billingInfo) {
        throw new Error('No active subscription found');
      }

      await stripe.subscriptions.update(billingInfo.stripe_subscription_id, {
        cancel_at_period_end: request.cancel_at_period_end,
      });

      // Update local database
      await supabase
        .from('subscriptions')
        .update({ 
          cancel_at_period_end: request.cancel_at_period_end,
          status: request.cancel_at_period_end ? 'active' : 'canceled'
        })
        .eq('id', billingInfo.id);

      // Log cancellation
      await supabase.from('subscription_changes').insert({
        tenant_id: tenantId,
        from_plan: billingInfo.plan_id,
        to_plan: billingInfo.plan_id,
        change_type: 'cancel',
        effective_date: request.cancel_at_period_end 
          ? billingInfo.current_period_end 
          : new Date().toISOString(),
        reason: request.reason,
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Create billing portal session
  static async createBillingPortalSession(
    tenantId: string,
    returnUrl?: string
  ): Promise<BillingPortalResponse> {
    try {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('stripe_customer_id')
        .eq('id', tenantId)
        .single();

      if (!tenant?.stripe_customer_id) {
        throw new Error('No Stripe customer found');
      }

      const stripe = this.getStripeInstance();
      const session = await stripe.billingPortal.sessions.create({
        customer: tenant.stripe_customer_id,
        return_url: returnUrl || `${import.meta.env.VITE_APP_URL}/billing`,
      });

      return { url: session.url };
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  // Get invoices for tenant
  static async getInvoices(tenantId: string, limit = 10): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  }

  // Get payment methods for tenant
  static async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  // Get current usage for tenant
  static async getCurrentUsage(tenantId: string): Promise<PlanUsage | null> {
    try {
      const billingInfo = await this.getBillingInfo(tenantId);
      if (!billingInfo) return null;

      const plan = SUBSCRIPTION_PLANS[billingInfo.plan_id];
      const currentPeriodStart = new Date(billingInfo.current_period_start);
      const currentPeriodEnd = new Date(billingInfo.current_period_end);

      // Get usage records for current billing period
      const { data: usageRecords } = await supabase
        .from('usage_records')
        .select('metric_type, quantity')
        .eq('tenant_id', tenantId)
        .gte('timestamp', currentPeriodStart.toISOString())
        .lte('timestamp', currentPeriodEnd.toISOString());

      // Calculate current usage
      const usage = {
        feedbacks_used: 0,
        locations_used: 0,
        campaigns_used: 0,
        sms_sent: 0,
        emails_sent: 0,
      };

      usageRecords?.forEach(record => {
        if (record.metric_type in usage) {
          usage[record.metric_type as keyof typeof usage] += record.quantity;
        }
      });

      return {
        tenant_id: tenantId,
        plan_id: billingInfo.plan_id,
        current_period: {
          ...usage,
          feedbacks_limit: plan.features.feedbacks_per_month,
          locations_limit: plan.features.locations,
          campaigns_limit: plan.features.campaigns_per_month,
        },
        overage_charges: {
          feedbacks: 0, // Calculate based on overage pricing
          sms: 0,
          emails: 0,
        },
      };
    } catch (error) {
      console.error('Error getting current usage:', error);
      throw error;
    }
  }

  // Record usage
  static async recordUsage(
    tenantId: string,
    metricType: 'feedbacks' | 'locations' | 'campaigns' | 'sms_sent' | 'emails_sent',
    quantity: number = 1
  ): Promise<void> {
    try {
      await supabase.from('usage_records').insert({
        tenant_id: tenantId,
        metric_type: metricType,
        quantity,
        timestamp: new Date().toISOString(),
        billing_period: new Date().toISOString().slice(0, 7), // YYYY-MM format
      });
    } catch (error) {
      console.error('Error recording usage:', error);
      throw error;
    }
  }

  // Get billing metrics (for admin dashboard)
  static async getBillingMetrics(): Promise<BillingMetrics> {
    try {
      // This would typically be calculated from aggregated data
      // For now, returning mock data structure
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan_id, status')
        .eq('status', 'active');

      const activeSubscriptions = subscriptions?.length || 0;
      
      // Calculate MRR by plan
      const revenueByPlan = subscriptions?.reduce((acc, sub) => {
        const plan = SUBSCRIPTION_PLANS[sub.plan_id as SubscriptionPlan];
        if (plan.price) {
          acc[sub.plan_id as SubscriptionPlan] = (acc[sub.plan_id as SubscriptionPlan] || 0) + plan.price;
        }
        return acc;
      }, {} as Record<SubscriptionPlan, number>) || {} as Record<SubscriptionPlan, number>;

      const mrr = Object.values(revenueByPlan).reduce((sum, revenue) => sum + revenue, 0) / 100;

      return {
        mrr,
        arr: mrr * 12,
        churn_rate: 0, // Calculate from historical data
        ltv: 0, // Calculate from historical data
        total_customers: activeSubscriptions,
        active_subscriptions: activeSubscriptions,
        trial_conversions: 0, // Calculate from trial data
        revenue_by_plan: revenueByPlan,
        growth_rate: 0, // Calculate from historical data
      };
    } catch (error) {
      console.error('Error getting billing metrics:', error);
      throw error;
    }
  }

  // Helper method to determine change type
  private static getChangeType(fromPlan: SubscriptionPlan, toPlan: SubscriptionPlan): 'upgrade' | 'downgrade' {
    const planOrder = ['starter', 'professional', 'enterprise', 'enterprise_plus'];
    const fromIndex = planOrder.indexOf(fromPlan);
    const toIndex = planOrder.indexOf(toPlan);
    
    return toIndex > fromIndex ? 'upgrade' : 'downgrade';
  }
}