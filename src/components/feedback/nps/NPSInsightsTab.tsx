import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedbackInsight } from '@/types/feedback';

interface NPSInsightsTabProps {
  insights: FeedbackInsight[] | undefined;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const NPSInsightsTab = ({ insights, isLoading, onRefresh }: NPSInsightsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights Automáticos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Carregando insights...</p>
            </div>
          ) : insights && insights.length > 0 ? (
            insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    insight.severity === 'high' && 'bg-red-100 text-red-600',
                    insight.severity === 'medium' && 'bg-yellow-100 text-yellow-600',
                    insight.severity === 'low' && 'bg-blue-100 text-blue-600'
                  )}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.action_items.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Ações recomendadas:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {insight.action_items.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start space-x-2">
                              <span>•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Badge variant={insight.severity === 'high' ? 'destructive' : 'secondary'}>
                    {insight.severity === 'high' ? 'Alta' : 
                     insight.severity === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum insight disponível no momento
              </p>
              {onRefresh && (
                <Button variant="outline" onClick={onRefresh} className="mt-4">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar Insights
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};