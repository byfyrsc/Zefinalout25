import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingService } from '@/services/billingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type {
  BillingInfo,
  Invoice,
  PaymentMethod,
  PlanUsage,
  CreateCheckoutSessionRequest,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
} from '@/types/billing';
import { SubscriptionPlan, getUsageLimit } from '@/lib/stripe'; // Import getUsageLimit

export const useBilling = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.tenant_id;

  // Get billing info
  const {
    data: billingInfo,
    isLoading: isBillingLoading,
    error: billingError,
  } = useQuery({
    queryKey: ['billing', tenantId],
    queryFn: () => BillingService.getBillingInfo(tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get invoices
  const {
    data: invoices,
    isLoading: isInvoicesLoading,
  } = useQuery({
    queryKey: ['invoices', tenantId],
    queryFn: () => BillingService.getInvoices(tenantId!),
    enabled: !!tenantId,
  });

  // Get payment methods
  const {
    data: paymentMethods,
    isLoading: isPaymentMethodsLoading,
  } = useQuery({
    queryKey: ['paymentMethods', tenantId],
    queryFn: () => BillingService.getPaymentMethods(tenantId!),
    enabled: !!tenantId,
  });

  // Get current usage
  const {
    data: currentUsage,
    isLoading: isUsageLoading,
  } = useQuery({
    queryKey: ['usage', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const billingInfoData = await BillingService.getBillingInfo(tenantId);
      if (!billingInfoData) return null;

      const currentPeriodStart = new Date(billingInfoData.current_period_start);
      const currentPeriodEnd = new Date(billingInfoData.current_period_end);

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
        plan_id: billingInfoData.plan_id,
        current_period: {
          ...usage,
          feedbacks_limit: getUsageLimit(billingInfoData.plan_id, 'feedbacks'),
          locations_limit: getUsageLimit(billingInfoData.plan_id, 'locations'),
          campaigns_limit: getUsageLimit(billingInfoData.plan_id, 'campaigns'),
        },
        overage_charges: {
          feedbacks: 0, // Calculate based on overage pricing
          sms: 0,
          emails: 0,
        },
      };
    },
    enabled: !!tenantId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Create checkout session mutation
  const createCheckoutSessionMutation = useMutation({
    mutationFn: (request: CreateCheckoutSessionRequest) =>
      BillingService.createCheckoutSession(tenantId!, request),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao criar sessão de pagamento');
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: (request: UpdateSubscriptionRequest) =>
      BillingService.updateSubscription(tenantId!, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['usage', tenantId] });
      toast.success('Plano atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast.error('Erro ao atualizar plano');
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: (request: CancelSubscriptionRequest) =>
      BillingService.cancelSubscription(tenantId!, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', tenantId] });
      toast.success('Assinatura cancelada com sucesso!');
    },
    onError: (error) => {
      console.error('Error canceling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
    },
  });

  // Create billing portal session mutation
  const createBillingPortalMutation = useMutation({
    mutationFn: (returnUrl?: string) =>
      BillingService.createBillingPortalSession(tenantId!, returnUrl),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error('Error creating billing portal session:', error);
      toast.error('Erro ao acessar portal de cobrança');
    },
  });

  // Helper functions
  const isOnTrial = billingInfo?.status === 'trialing';
  const isActive = billingInfo?.status === 'active';
  const isPastDue = billingInfo?.status === 'past_due';
  const isCanceled = billingInfo?.status === 'canceled';
  const willCancelAtPeriodEnd = billingInfo?.cancel_at_period_end;

  const trialEndsAt = billingInfo?.trial_end ? new Date(billingInfo.trial_end) : null;
  const currentPeriodEndsAt = billingInfo?.current_period_end ? new Date(billingInfo.current_period_end) : null;
  
  const daysUntilTrialEnd = trialEndsAt 
    ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const daysUntilPeriodEnd = currentPeriodEndsAt
    ? Math.ceil((currentPeriodEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Usage helpers
  const getUsagePercentage = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const isOverLimit = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return false;
    return used > limit;
  };

  const isNearLimit = (used: number, limit: number | 'unlimited', threshold = 0.8) => {
    if (limit === 'unlimited') return false;
    return used / limit >= threshold;
  };

  return {
    // Data
    billingInfo,
    invoices,
    paymentMethods,
    currentUsage,
    
    // Loading states
    isBillingLoading,
    isInvoicesLoading,
    isPaymentMethodsLoading,
    isUsageLoading,
    
    // Error states
    billingError,
    
    // Mutations
    createCheckoutSession: createCheckoutSessionMutation.mutate,
    updateSubscription: updateSubscriptionMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    createBillingPortal: createBillingPortalMutation.mutate,
    
    // Mutation states
    isCreatingCheckout: createCheckoutSessionMutation.isPending,
    isUpdatingSubscription: updateSubscriptionMutation.isPending,
    isCancelingSubscription: cancelSubscriptionMutation.isPending,
    isCreatingBillingPortal: createBillingPortalMutation.isPending,
    
    // Status helpers
    isOnTrial,
    isActive,
    isPastDue,
    isCanceled,
    willCancelAtPeriodEnd,
    
    // Date helpers
    trialEndsAt,
    currentPeriodEndsAt,
    daysUntilTrialEnd,
    daysUntilPeriodEnd,
    
    // Usage helpers
    getUsagePercentage,
    isOverLimit,
    isNearLimit,
  };
};

export const useSubscriptionPlans = () => {
  const { billingInfo } = useBilling();
  
  const currentPlan = billingInfo?.plan_id;
  
  const canUpgradeTo = (planId: SubscriptionPlan) => {
    if (!currentPlan) return true;
    
    const planOrder = ['starter', 'professional', 'enterprise', 'enterprise_plus'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planId);
    
    return targetIndex > currentIndex;
  };
  
  const canDowngradeTo = (planId: SubscriptionPlan) => {
    if (!currentPlan) return false;
    
    const planOrder = ['starter', 'professional', 'enterprise', 'enterprise_plus'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planId);
    
    return targetIndex < currentIndex;
  };
  
  return {
    currentPlan,
    canUpgradeTo,
    canDowngradeTo,
  };
};

export const useBillingMetrics = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['billingMetrics'],
    queryFn: () => BillingService.getBillingMetrics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  return {
    metrics,
    isLoading,
  };
};