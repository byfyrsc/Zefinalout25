import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useNPSMetrics, useFeedbackAnalytics } from '@/hooks/useFeedback';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NPSMetrics, NPSCategory } from '@/types/feedback';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NPSEngineProps {
  locationId?: string;
  showFilters?: boolean;
  showBenchmarks?: boolean;
}

const NPS_COLORS = {
  promoter: '#22c55e',
  passive: '#f59e0b',
  detractor: '#ef4444',
};

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

const NPSScoreCard = ({ metrics }: { metrics: NPSMetrics }) => {
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

const NPSBreakdownCard = ({ metrics }: { metrics: NPSMetrics }) => {
  const total = metrics.total_responses;
  const promoterPercentage = total > 0 ? (metrics.promoters / total) * 100 : 0;
  const passivePercentage = total > 0 ? (metrics.passives / total) * 100 : 0;
  const detractorPercentage = total > 0 ? (metrics.detractors / total) * 100 : 0;

  const pieData = [
    { name: 'Promotores', value: metrics.promoters, percentage: promoterPercentage, color: NPS_COLORS.promoter },
    { name: 'Neutros', value: metrics.passives, percentage: passivePercentage, color: NPS_COLORS.passive },
    { name: 'Detratores', value: metrics.detractors, percentage: detractorPercentage, color: NPS_COLORS.detractor },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Distribuição NPS</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bars */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Promotores (9-10)</span>
                </div>
                <span className="font-medium">
                  {metrics.promoters} ({promoterPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={promoterPercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Neutros (7-8)</span>
                </div>
                <span className="font-medium">
                  {metrics.passives} ({passivePercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={passivePercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Detratores (0-6)</span>
                </div>
                <span className="font-medium">
                  {metrics.detractors} ({detractorPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={detractorPercentage} className="h-2" />
            </div>
          </div>
          
          {/* Pie Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} (${((value / total) * 100).toFixed(1)}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NPSBenchmarkCard = ({ metrics }: { metrics: NPSMetrics }) => {
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

const NPSTrendChart = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Tendência NPS</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-100, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="nps_score" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const NPSEngine = ({ locationId, showFilters = true, showBenchmarks = true }: NPSEngineProps) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(locationId);
  
  const { npsMetrics, isNPSLoading, npsError } = useNPSMetrics(
    selectedLocation,
    dateRange.from?.toISOString(),
    dateRange.to?.toISOString()
  );

  const { analytics, isAnalyticsLoading } = useFeedbackAnalytics({
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
          <Button variant="outline">
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
          <Card>
            <CardHeader>
              <CardTitle>NPS por Segmento</CardTitle>
            </CardHeader>
            <CardContent>
              {npsMetrics.segments.length > 0 ? (
                <div className="space-y-4">
                  {npsMetrics.segments.map((segment, index) => (
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
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.insights && analytics.insights.length > 0 ? (
                  analytics.insights.map((insight, index) => (
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};