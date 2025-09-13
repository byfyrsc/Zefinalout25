import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NPSMetrics } from '@/types/feedback';

interface NPSScoreCardProps {
  metrics: NPSMetrics;
}

const NPS_SCORE_COLORS = {
  excellent: '#22c55e', // 70+
  good: '#84cc16',      // 50-69
  fair: '#f59e0b',      // 0-49
  poor: '#ef4444',      // negative
};

const getNPSScoreColor = (score: number) => {
  if (score >= 70) return NPS_SCORE_COLORS.excellent;
  if (score >= 50) return NPS_SCORE_COLORS.good;
  if (score >= 0) return NPS_SCORE_COLORS.fair;
  return NPS_SCORE_COLORS.poor;
};

const getNPSScoreLabel = (score: number) => {
  if (score >= 70) return 'Excelente';
  if (score >= 50) return 'Bom';
  if (score >= 0) return 'Regular';
  return 'Ruim';
};

export const NPSScoreCard = ({ metrics }: NPSScoreCardProps) => {
  const scoreColor = getNPSScoreColor(metrics.nps_score);
  const scoreLabel = getNPSScoreLabel(metrics.nps_score);
  
  const getTrendIcon = () => {
    if (metrics.trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (metrics.trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card className="relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{ backgroundColor: scoreColor }}
      />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            NPS Score
          </CardTitle>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <Badge 
              variant="outline" 
              style={{ borderColor: scoreColor, color: scoreColor }}
            >
              {scoreLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div 
              className="text-4xl font-bold mb-2"
              style={{ color: scoreColor }}
            >
              {metrics.nps_score}
            </div>
            <p className="text-sm text-muted-foreground">
              {metrics.total_responses} respostas
            </p>
          </div>
          
          {metrics.previous_nps_score !== undefined && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className="text-muted-foreground">vs período anterior:</span>
              <span className={cn(
                'font-medium',
                metrics.nps_score > metrics.previous_nps_score ? 'text-green-600' : 
                metrics.nps_score < metrics.previous_nps_score ? 'text-red-600' : 'text-gray-600'
              )}>
                {metrics.nps_score > metrics.previous_nps_score ? '+' : ''}
                {metrics.nps_score - metrics.previous_nps_score}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};