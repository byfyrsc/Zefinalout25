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
    description: 'Ideal para pequenos restaurantes que estão começando a coletar feedback.',
    prices: {
      monthly: 9700, // R$ 97.00 in cents
      annual: 9700 * 10, // 10 months equivalent for annual discount
    },
    currency: 'brl',
    interval: 'month',
    features: [
      '1 localização',
      '500 feedbacks/mês',
      'Dashboard básico',
      'Suporte por email',
      'Templates básicos',
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Para restaurantes que buscam automação e analytics avançado.',
    prices: {
      monthly: 29700, // R$ 297.00 in cents
      annual: 29700 * 10, // 10 months equivalent for annual discount
    },
    currency: 'brl',
    interval: 'month',
    features: [
      '5 localizações',
      '2.500 feedbacks/mês',
      'Campanhas automatizadas',
      'SMS + WhatsApp',
      'Analytics avançado',
      'Acesso à API',
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solução completa para grandes redes com múltiplas marcas e customizações.',
    prices: {
      monthly: 59700, // R$ 597.00 in cents
      annual: 59700 * 10, // 10 months equivalent for annual discount
    },
    currency: 'brl',
    interval: 'month',
    features: [
      'Localizações ilimitadas',
      'Feedbacks ilimitados',
      'White-label',
      'Integrações customizadas',
      'Gerente de conta dedicado',
      'Multi-marca',
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
  },
  enterprise_plus: {
    id: 'enterprise_plus',
    name: 'Enterprise+',
    description: 'Infraestrutura dedicada e desenvolvimento customizado para necessidades exclusivas.',
    prices: {
      monthly: null, // Custom pricing
      annual: null, // Custom pricing
    },
    currency: 'brl',
    interval: 'month',
    features: [
      'Localizações ilimitadas',
      'Feedbacks ilimitados',
      'Campanhas ilimitadas',
      'Dashboard Enterprise',
      'Suporte dedicado',
      'Templates ilimitados',
      'Analytics completo',
      'Acesso à API',
      'White-label',
      'SMS + WhatsApp',
      'Automação completa',
      'Integrações customizadas',
      'Gerente de conta dedicado',
      'Multi-marca',
      'Infraestrutura dedicada',
      'Desenvolvimento customizado',
      'SLA garantido',
      'Treinamento on-site',
    ],
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
  // This function needs to be updated if features are now string arrays
  // For now, it will check if the feature string exists in the array
  return Array.isArray(planFeatures) && planFeatures.includes(feature);
};

export const getUsageLimit = (userPlan: SubscriptionPlan, limitType: string) => {
  // This function needs to be updated if features are now string arrays
  // For now, it will return 'unlimited' or a mock value
  const planFeatures = getPlanFeatures(userPlan);
  if (Array.isArray(planFeatures)) {
    const limitFeature = planFeatures.find(f => f.toLowerCase().includes(limitType.toLowerCase()));
    if (limitFeature?.includes('ilimitado')) return 'unlimited';
    const match = limitFeature?.match(/\d+/);
    return match ? parseInt(match[0]) : 'unlimited';
  }
  return 'unlimited';
};