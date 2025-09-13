import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NPSMetrics } from '@/types/feedback';

interface NPSSegmentsTabProps {
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

export const NPSSegmentsTab = ({ metrics }: NPSSegmentsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NPS por Segmento</CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.segments.length > 0 ? (
          <div className="space-y-4">
            {metrics.segments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{segment.segment_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {segment.response_count} respostas
                  </p>
                </div>
                <div className="text-right">
                  <div 
                    className="text-xl font-bold"
                    style={{ color: getNPSScoreColor(segment.nps_score) }}
                  >
                    {segment.nps_score}
                  </div>
                  <Badge variant="outline">
                    {getNPSScoreLabel(segment.nps_score)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum segmento disponível para o período selecionado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};