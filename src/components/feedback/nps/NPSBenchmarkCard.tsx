import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, BarChart3, Target } from 'lucide-react';
import type { NPSMetrics } from '@/types/feedback';

interface NPSBenchmarkCardProps {
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

export const NPSBenchmarkCard = ({ metrics }: NPSBenchmarkCardProps) => {
  const benchmarks = [
    {
      label: 'Seu Score',
      value: metrics.nps_score,
      color: getNPSScoreColor(metrics.nps_score),
      icon: Target,
    },
    {
      label: 'Média da Indústria',
      value: metrics.industry_average || 45,
      color: '#6b7280',
      icon: BarChart3,
    },
    {
      label: 'Benchmark',
      value: metrics.benchmark_score || 60,
      color: '#8b5cf6',
      icon: Award,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-5 w-5" />
          <span>Benchmarks</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {benchmarks.map((benchmark, index) => {
            const Icon = benchmark.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${benchmark.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: benchmark.color }} />
                  </div>
                  <span className="font-medium">{benchmark.label}</span>
                </div>
                <div className="text-right">
                  <div 
                    className="text-xl font-bold"
                    style={{ color: benchmark.color }}
                  >
                    {benchmark.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getNPSScoreLabel(benchmark.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};