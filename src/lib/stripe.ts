import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Client-side Stripe instance
// Note: The HTTPS warning in console is normal for development over HTTP
// In production, ensure your app is served over HTTPS
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not defined');
}

export const stripePromise = loadStripe(stripePublishableKey);

// Server-side Stripe instance (for Edge Functions)
// Note: This should only be used in server-side code (Edge Functions, API routes)
// The secret key should not be exposed to the client
export const createStripeInstance = (secretKey: string) => {
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });
};

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'brl',
  country: 'BR',
  paymentMethods: ['card', 'pix', 'boleto'],
  webhookEndpoint: '/api/webhooks/stripe',
  successUrl: `${window.location.origin}/billing/success`,
  cancelUrl: `${window.location.origin}/billing/cancel`,
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9700, // R$ 97.00 in cents
    currency: 'brl',
    interval: 'month',
    features: {
      locations: 1,
      feedbacks_per_month: 500,
      campaigns_per_month: 5,
      dashboard: 'basic',
      support: 'email',
      templates: 'basic',
      analytics: false,
      api_access: false,
      whitelabel: false,
    },
    stripePriceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 29700, // R$ 297.00 in cents
    currency: 'brl',
    interval: 'month',
    features: {
      locations: 5,
      feedbacks_per_month: 2500,
      campaigns_per_month: 'unlimited',
      dashboard: 'advanced',
      support: 'priority',
      templates: 'advanced',
      analytics: true,
      api_access: true,
      whitelabel: false,
      sms_whatsapp: true,
      automation: true,
    },
    stripePriceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 59700, // R$ 597.00 in cents
    currency: 'brl',
    interval: 'month',
    features: {
      locations: 'unlimited',
      feedbacks_per_month: 'unlimited',
      campaigns_per_month: 'unlimited',
      dashboard: 'enterprise',
      support: 'dedicated',
      templates: 'unlimited',
      analytics: true,
      api_access: true,
      whitelabel: true,
      sms_whatsapp: true,
      automation: true,
      integrations: 'custom',
      account_manager: true,
      multi_brand: true,
    },
    stripePriceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
  },
  enterprise_plus: {
    id: 'enterprise_plus',
    name: 'Enterprise+',
    price: null, // Custom pricing
    currency: 'brl',
    interval: 'month',
    features: {
      locations: 'unlimited',
      feedbacks_per_month: 'unlimited',
      campaigns_per_month: 'unlimited',
      dashboard: 'enterprise',
      support: 'dedicated',
      templates: 'unlimited',
      analytics: true,
      api_access: true,
      whitelabel: true,
      sms_whatsapp: true,
      automation: true,
      integrations: 'custom',
      account_manager: true,
      multi_brand: true,
      dedicated_infrastructure: true,
      custom_development: true,
      sla_guarantee: true,
      onsite_training: true,
    },
    stripePriceId: null, // Custom pricing
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// Helper functions
export const formatPrice = (price: number | null, currency = 'BRL') => {
  if (price === null) return 'Sob consulta';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price / 100);
};

export const getPlanFeatures = (planId: SubscriptionPlan) => {
  return SUBSCRIPTION_PLANS[planId].features;
};

export const canAccessFeature = (userPlan: SubscriptionPlan, feature: string) => {
  const planFeatures = getPlanFeatures(userPlan);
  return planFeatures[feature as keyof typeof planFeatures] === true;
};

export const getUsageLimit = (userPlan: SubscriptionPlan, limitType: string) => {
  const planFeatures = getPlanFeatures(userPlan);
  return planFeatures[limitType as keyof typeof planFeatures];
};