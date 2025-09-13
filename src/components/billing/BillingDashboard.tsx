import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBilling } from '@/hooks/useBilling';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe';
import { PricingPlans } from './PricingPlans';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, Settings, AlertTriangle, Clock, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusInfo = {
  active: { label: 'Ativo', className: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
  trialing: { label: 'Em Teste', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Clock },
  past_due: { label: 'Atrasado', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: AlertTriangle },
  canceled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: AlertTriangle },
  unpaid: { label: 'Não Pago', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: AlertTriangle },
  incomplete: { label: 'Incompleto', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: AlertTriangle },
};

const UsageBar = ({ title, used, limit }) => {
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    const isUnlimited = limit === Infinity;

    return (
        <div>
            <div className="flex justify-between items-end mb-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-sm text-foreground">
                    <span className="font-bold">{used}</span>
                    {!isUnlimited && <span className="text-muted-foreground"> / {limit}</span>}
                </p>
            </div>
            {!isUnlimited && <Progress value={percentage} />}
        </div>
    );
};

export const BillingDashboard = () => {
  const {
    billingInfo,
    invoices,
    currentUsage,
    isBillingLoading,
    isInvoicesLoading,
    createBillingPortal,
    isCreatingBillingPortal,
    isOnTrial,
    isPastDue,
    willCancelAtPeriodEnd,
    daysUntilTrialEnd,
  } = useBilling();

  if (isBillingLoading) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="lg:col-span-2">
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
    );
  }

  const currentPlan = billingInfo ? SUBSCRIPTION_PLANS[billingInfo.plan_id] : null;
  const currentStatusInfo = billingInfo ? statusInfo[billingInfo.status] : null;

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Faturamento</h1>
                <p className="text-muted-foreground">Gerencie sua assinatura, uso e histórico de pagamentos.</p>
            </div>
            <Button
                onClick={() => createBillingPortal()}
                disabled={isCreatingBillingPortal || !billingInfo}
            >
                {isCreatingBillingPortal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                Portal do Cliente
            </Button>
        </div>

        {/* Status Alerts */}
        {isOnTrial && daysUntilTrialEnd !== null && (
            <Alert variant="default" className="bg-blue-500/10 border-blue-500/20 text-blue-700">
                <Clock className="h-4 w-4 !text-blue-700" />
                <AlertTitle>Você está em um período de teste!</AlertTitle>
                <AlertDescription>
                    Seu teste gratuito termina em <strong>{daysUntilTrialEnd} dia{daysUntilTrialEnd !== 1 ? 's' : ''}</strong>. Faça upgrade para não perder o acesso.
                </AlertDescription>
            </Alert>
        )}
        {isPastDue && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Pagamento Pendente</AlertTitle>
                <AlertDescription>
                    Não conseguimos processar seu pagamento. Por favor, <strong>atualize suas informações de cobrança</strong> para manter sua conta ativa.
                </AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Plan */}
            {billingInfo && currentPlan && (
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Seu Plano</CardTitle>
                        {currentStatusInfo && (
                            <Badge variant="outline" className={cn("w-fit", currentStatusInfo.className)}>{currentStatusInfo.label}</Badge>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-3xl font-bold">{currentPlan.name}</p>
                            <p className="text-muted-foreground">{formatPrice(billingInfo.is_annual ? currentPlan.prices.annual : currentPlan.prices.monthly)}/{billingInfo.is_annual ? 'ano' : 'mês'}</p>
                        </div>
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Data da cobrança:</span>
                                <span className="font-medium">{new Date(billingInfo.current_period_end).toLocaleDateString('pt-BR')}</span>
                            </div>
                            {willCancelAtPeriodEnd && (
                                <div className="flex justify-between text-orange-600">
                                    <span className="text-muted-foreground">Cancela em:</span>
                                    <span className="font-medium">{new Date(billingInfo.current_period_end).toLocaleDateString('pt-BR')}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Pagamento:</span>
                                <span className="font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" /> {billingInfo.payment_method}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Current Usage */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Uso Atual</CardTitle>
                    <CardDescription>Seu consumo no período atual. O ciclo renova em {new Date(billingInfo?.current_period_end).toLocaleDateString('pt-BR')}.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <UsageBar title="Feedbacks" used={currentUsage?.feedbacks_used || 0} limit={currentPlan?.usage.feedbacks_limit || 0} />
                    <UsageBar title="Campanhas" used={currentUsage?.campaigns_used || 0} limit={currentPlan?.usage.campaigns_limit || 0} />
                    <UsageBar title="Localizações" used={currentUsage?.locations_used || 0} limit={currentPlan?.usage.locations_limit || 0} />
                </CardContent>
            </Card>
        </div>

        {/* Invoices */}
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Faturas</CardTitle>
                <CardDescription>Seu histórico de pagamentos e faturas para download.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Número</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isInvoicesLoading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : invoices && invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className="capitalize">
                                            {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(invoice.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell className="font-mono text-xs">{invoice.stripe_invoice_id.slice(-10)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatPrice(invoice.amount_paid)}</TableCell>
                                    <TableCell className="text-right">
                                        {invoice.hosted_invoice_url && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                                                    Ver Fatura <ExternalLink className="ml-2 h-3 w-3" />
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Nenhuma fatura encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Change Plan */}
        <div>
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Mudar de Plano</h2>
                <p className="mt-2 text-lg text-muted-foreground">Flexibilidade para crescer. Faça upgrade ou downgrade quando quiser.</p>
            </div>
            <PricingPlans onPlanSelect={(planId) => console.log('Selected plan:', planId)} />
        </div>
    </div>
  );
};