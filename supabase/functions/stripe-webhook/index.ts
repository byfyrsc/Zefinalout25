import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
}

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    const body = await req.text();
    let event: WebhookEvent;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret) as WebhookEvent;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Log the event
    await supabase.from('billing_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      data: event.data,
      processed: false,
    });

    // Process the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase
      .from('billing_events')
      .update({ processed: true })
      .eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
});

async function handleSubscriptionCreated(subscription: any) {
  const tenantId = subscription.metadata?.tenant_id;
  if (!tenantId) {
    console.error('No tenant_id in subscription metadata');
    return;
  }

  await supabase.from('subscriptions').insert({
    tenant_id: tenantId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    plan_id: subscription.metadata?.plan_id || 'starter',
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  console.log(`Subscription created for tenant: ${tenantId}`);
}

async function handleSubscriptionUpdated(subscription: any) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      plan_id: subscription.metadata?.plan_id,
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: any) {
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription deleted: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tenant_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (!subscription) {
    console.error('Subscription not found for invoice:', invoice.id);
    return;
  }

  // Insert or update invoice record
  await supabase.from('invoices').upsert({
    tenant_id: subscription.tenant_id,
    stripe_invoice_id: invoice.id,
    amount_paid: invoice.amount_paid,
    amount_due: invoice.amount_due,
    currency: invoice.currency,
    status: invoice.status,
    invoice_pdf: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    payment_intent_id: invoice.payment_intent,
    paid_at: invoice.status_transitions?.paid_at 
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() 
      : null,
  });

  console.log(`Invoice payment succeeded: ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice: any) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tenant_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (!subscription) {
    console.error('Subscription not found for invoice:', invoice.id);
    return;
  }

  // Update invoice record
  await supabase.from('invoices').upsert({
    tenant_id: subscription.tenant_id,
    stripe_invoice_id: invoice.id,
    amount_paid: invoice.amount_paid,
    amount_due: invoice.amount_due,
    currency: invoice.currency,
    status: invoice.status,
    invoice_pdf: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    payment_intent_id: invoice.payment_intent,
  });

  // Start dunning process
  await startDunningProcess(subscription.tenant_id, invoice.id);

  console.log(`Invoice payment failed: ${invoice.id}`);
}

async function handleCheckoutSessionCompleted(session: any) {
  if (session.mode === 'subscription') {
    // Update checkout session status
    await supabase
      .from('checkout_sessions')
      .update({ status: 'complete' })
      .eq('stripe_session_id', session.id);

    console.log(`Checkout session completed: ${session.id}`);
  }
}

async function handleCustomerCreated(customer: any) {
  const tenantId = customer.metadata?.tenant_id;
  if (!tenantId) {
    console.error('No tenant_id in customer metadata');
    return;
  }

  // Update tenant with Stripe customer ID
  await supabase
    .from('tenants')
    .update({ stripe_customer_id: customer.id })
    .eq('id', tenantId);

  console.log(`Customer created for tenant: ${tenantId}`);
}

async function handlePaymentMethodAttached(paymentMethod: any) {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', paymentMethod.customer)
    .single();

  if (!tenant) {
    console.error('Tenant not found for customer:', paymentMethod.customer);
    return;
  }

  // Insert payment method record
  await supabase.from('payment_methods').insert({
    tenant_id: tenant.id,
    stripe_payment_method_id: paymentMethod.id,
    type: paymentMethod.type,
    card: paymentMethod.card ? {
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      exp_month: paymentMethod.card.exp_month,
      exp_year: paymentMethod.card.exp_year,
    } : null,
    is_default: false, // Will be updated separately if needed
  });

  console.log(`Payment method attached: ${paymentMethod.id}`);
}

async function startDunningProcess(tenantId: string, invoiceId: string) {
  // Create first dunning attempt
  await supabase.from('dunning_attempts').insert({
    tenant_id: tenantId,
    invoice_id: invoiceId,
    attempt_number: 1,
    method: 'email',
    status: 'sent',
    scheduled_at: new Date().toISOString(),
    executed_at: new Date().toISOString(),
    next_attempt_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours later
  });

  console.log(`Dunning process started for tenant: ${tenantId}`);
}