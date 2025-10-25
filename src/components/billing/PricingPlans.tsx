import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBilling, useSubscriptionPlans } from '@/hooks/useBilling';
import { SUBSCRIPTION_PLANS, formatPrice, SubscriptionPlan } from '@/lib/stripe';
import { Check, Crown, Star, Zap, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingPlansProps {
  onPlanSelect?: (planId: SubscriptionPlan) => void;
}

const planIcons = {
  starter: Star,
  professional: Zap,
  enterprise: Crown,
  enterprise_plus: Sparkles, // Added icon for enterprise_plus
};

export const PricingPlans = ({ onPlanSelect }: PricingPlansProps) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { createCheckoutSession, isCreatingCheckout } = useBilling();
  const { currentPlan, canUpgradeTo, canDowngradeTo } = useSubscriptionPlans();

  const handlePlanSelect = async (planId: SubscriptionPlan) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
      return;
    }

    if (planId === 'enterprise_plus') { // Changed from 'enterprise' to 'enterprise_plus' for sales contact
      window.open('mailto:vendas@digaze.com?subject=Contato Plano Enterprise+', '_blank');
      return;
    }

    await createCheckoutSession({
      plan_id: planId,
      is_annual: isAnnual,
    });
  };

  const getButtonText = (planId: SubscriptionPlan) => {
    if (currentPlan?.id === planId) return 'Plano Atual';
    if (canUpgradeTo(planId)) return 'Fazer Upgrade';
    if (canDowngradeTo(planId)) return 'Fazer Downgrade';
    if (planId === 'enterprise_plus') return 'Falar com Vendas'; // Changed to enterprise_plus
    return 'Começar Agora';
  };

  return (
    <div className="space-y-8">
      {/* Annual/Monthly Toggle */}
      <div className="flex items-center justify-center space-x-3">
        <Label htmlFor="billing-toggle" className={cn('font-medium', !isAnnual && 'text-primary')}>Mensal</Label>
        <Switch
          id="billing-toggle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          aria-label="Alternar entre cobrança mensal e anual"
        />
        <Label htmlFor="billing-toggle" className={cn('font-medium', isAnnual && 'text-primary')}>Anual</Label>
        <Badge variant="default" className="animate-pulse">Economize 20%</Badge>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
        {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
          const Icon = planIcons[planId as SubscriptionPlan] || Sparkles;
          const isPopular = planId === 'professional';
          const isCurrent = currentPlan?.id === planId;
          
          // Safely access prices, handling null for enterprise_plus
          const monthlyPrice = plan.prices?.monthly;
          const annualPrice = plan.prices?.annual;
          const price = isAnnual ? annualPrice : monthlyPrice;

          return (
            <Card 
              key={planId}
              className={cn(
                'flex flex-col h-full transition-all duration-300 border-2 bg-card',
                isPopular ? 'border-primary' : 'border-border',
                isCurrent && 'border-success'
              )}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1 text-sm font-bold">Mais Popular</Badge>
                </div>
              )}
              
              <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full mb-2">
                    <Icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription> {/* Use plan.description */}
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                    <div className="text-center">
                        {price !== null ? ( // Check if price is not null
                        <>
                            <span className="text-4xl font-bold">{formatPrice(price)}</span>
                            <span className="text-muted-foreground">/{isAnnual ? 'ano' : 'mês'}</span>
                            {isAnnual && monthlyPrice !== null && ( // Check monthlyPrice for null
                                <p className="text-sm text-muted-foreground line-through mt-1">
                                    {formatPrice(monthlyPrice * 12)}/ano no plano mensal
                                </p>
                            )}
                        </>
                        ) : (
                        <span className="text-3xl font-bold">Sob Consulta</span>
                        )}
                    </div>
                    <ul className="space-y-3 text-sm">
                        {plan.features.map((feature, index) => ( // Iterate over features array
                            <li key={index} className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full text-lg py-6"
                  size="lg"
                  variant={isPopular ? 'default' : 'outline'}
                  disabled={isCurrent || isCreatingCheckout}
                  onClick={() => handlePlanSelect(planId as SubscriptionPlan)}
                >
                  {isCreatingCheckout ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</>
                  ) : (
                    <>{getButtonText(planId as SubscriptionPlan)}</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {!currentPlan && (
          <p className="text-center text-sm text-muted-foreground">
              Todos os planos incluem 14 dias de teste gratuito. Cancele quando quiser.
          </p>
      )}
    </div>
  );
};