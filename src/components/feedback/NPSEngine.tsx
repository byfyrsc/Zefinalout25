import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useNPSMetrics, useFeedbackAnalytics } from '@/hooks/useFeedback';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { NPSMetrics } from '@/types/feedback';

// Importar os novos sub-componentes
import { NPSScoreCard } from './nps/NPSScoreCard';
import { NPSBreakdownCard } from './nps/NPSBreakdownCard';
import { NPSBenchmarkCard } from './nps/NPSBenchmarkCard';
import { NPSTrendChart } from './nps/NPSTrendChart';
import { NPSSegmentsTab } from './nps/NPSSegmentsTab';
import { NPSInsightsTab } from './nps/NPSInsightsTab';

interface NPSEngineProps {
  locationId?: string;
  showFilters?: boolean;
  showBenchmarks?: boolean;
}

export const NPSEngine = ({ locationId, showFilters = true, showBenchmarks = true }: NPSEngineProps) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(locationId);
  
  const { npsMetrics, isNPSLoading, npsError, refetch: refetchNPSMetrics } = useNPSMetrics( // Adicionado refetch
    selectedLocation,
    dateRange.from?.toISOString(),
    dateRange.to?.toISOString()
  );

  const { analytics, isAnalyticsLoading, refetch: refetchInsights } = useFeedbackAnalytics({
    location_ids: selectedLocation ? [selectedLocation] : undefined,
    date_from: dateRange.from?.toISOString(),
    date_to: dateRange.to?.toISOString(),
    metrics: ['nps'],
  });

  // Mock trend data - in real implementation, this would come from the API
  const trendData = [
    { date: '2024-01', nps_score: 45 },
    { date: '2024-02', nps_score: 52 },
    { date: '2024-03', nps_score: 48 },
    { date: '2024-04', nps_score: 55 },
    { date: '2024-05', nps_score: 62 },
    { date: '2024-06', nps_score: npsMetrics?.nps_score || 58 },
  ];

  if (isNPSLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (npsError || !npsMetrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados NPS</h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar as métricas NPS. Tente novamente.
          </p>
          <Button variant="outline" onClick={() => refetchNPSMetrics()}> {/* Adicionado onClick para refetch */}
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NPS Engine</h2>
          <p className="text-muted-foreground">
            Acompanhe e analise seu Net Promoter Score em tempo real
          </p>
        </div>
        
        {showFilters && (
          <div className="flex items-center space-x-3">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        )}
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NPSScoreCard metrics={npsMetrics} />
        <NPSBreakdownCard metrics={npsMetrics} />
        {showBenchmarks && <NPSBenchmarkCard metrics={npsMetrics} />}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trend" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trend">Tendência</TabsTrigger>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trend" className="space-y-6">
          <NPSTrendChart data={trendData} />
        </TabsContent>
        
        <TabsContent value="segments" className="space-y-6">
          <NPSSegmentsTab metrics={npsMetrics} />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <NPSInsightsTab 
            insights={analytics?.insights} 
            isLoading={isAnalyticsLoading} 
            onRefresh={refetchInsights} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};