import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  Users,
  Star,
  MessageSquare,
  ChevronRight,
  Sparkles,
  BarChart3,
  PieChart,
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "prediction" | "recommendation" | "alert" | "opportunity";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  category: string;
  actionable: boolean;
  timeframe?: string;
  metrics?: {
    current: number;
    predicted: number;
    unit: string;
  };
}

const mockAIInsights: AIInsight[] = [
  {
    id: "1",
    type: "prediction",
    title: "Queda prevista na satisfação do jantar",
    description: "Baseado nos padrões históricos e feedback recente, prevemos uma queda de 8% na satisfação durante o horário de jantar nos próximos 7 dias.",
    impact: "high",
    confidence: 87,
    category: "Satisfação do Cliente",
    actionable: true,
    timeframe: "Próximos 7 dias",
    metrics: {
      current: 4.2,
      predicted: 3.8,
      unit: "estrelas"
    }
  },
  {
    id: "2",
    type: "recommendation",
    title: "Otimização do menu para horário de pico",
    description: "Análise de tempo de preparo indica que pratos mais simples no menu de almoço poderiam reduzir tempo de espera em 15% durante o rush.",
    impact: "medium",
    confidence: 92,
    category: "Operações",
    actionable: true,
    timeframe: "Implementação imediata"
  },
  {
    id: "3",
    type: "alert",
    title: "Aumento de reclamações sobre limpeza",
    description: "Detectado aumento de 23% nas menções negativas sobre limpeza nas últimas 48h. Requer atenção imediata.",
    impact: "high",
    confidence: 95,
    category: "Qualidade",
    actionable: true,
    timeframe: "Imediato"
  },
  {
    id: "4",
    type: "opportunity",
    title: "Potencial para programa de fidelidade",
    description: "34% dos clientes frequentes mostram padrão de visitas que sugere alta receptividade a programa de pontos/benefícios.",
    impact: "medium",
    confidence: 78,
    category: "Marketing",
    actionable: true,
    timeframe: "30-45 dias"
  },
  {
    id: "5",
    type: "prediction",
    title: "Pico de demanda esperado",
    description: "Modelos preveem aumento de 40% no volume de clientes no próximo fim de semana devido a eventos locais.",
    impact: "medium",
    confidence: 84,
    category: "Demanda",
    actionable: true,
    timeframe: "Próximo fim de semana"
  }
];

const AIInsights = () => {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const getTypeIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "prediction":
        return <BarChart3 className="h-4 w-4" />;
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "opportunity":
        return <Target className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "prediction":
        return "text-primary";
      case "recommendation":
        return "text-accent";
      case "alert":
        return "text-destructive";
      case "opportunity":
        return "text-success";
    }
  };

  const getImpactColor = (impact: AIInsight["impact"]) => {
    switch (impact) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-muted-foreground";
    }
  };

  const getTypeLabel = (type: AIInsight["type"]) => {
    switch (type) {
      case "prediction":
        return "Predição";
      case "recommendation":
        return "Recomendação";
      case "alert":
        return "Alerta";
      case "opportunity":
        return "Oportunidade";
    }
  };

  const filteredInsights = activeTab === "all" 
    ? mockAIInsights 
    : mockAIInsights.filter(insight => insight.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Insights de IA</h2>
            <p className="text-muted-foreground">Análises preditivas e recomendações inteligentes</p>
          </div>
        </div>
        
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Gerar Novos Insights
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Insights</p>
                <p className="text-2xl font-bold">{mockAIInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">
                  {mockAIInsights.filter(i => i.type === "alert").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
                <p className="text-2xl font-bold">
                  {mockAIInsights.filter(i => i.type === "opportunity").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Star className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
                <p className="text-2xl font-bold">
                  {Math.round(mockAIInsights.reduce((acc, i) => acc + i.confidence, 0) / mockAIInsights.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="alert">Alertas</TabsTrigger>
          <TabsTrigger value="prediction">Predições</TabsTrigger>
          <TabsTrigger value="recommendation">Recomendações</TabsTrigger>
          <TabsTrigger value="opportunity">Oportunidades</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Insights */}
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <Card 
                  key={insight.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-medium ${
                    selectedInsight?.id === insight.id ? 'ring-2 ring-primary shadow-medium' : ''
                  }`}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${
                            insight.type === 'alert' ? 'bg-destructive/10' :
                            insight.type === 'opportunity' ? 'bg-success/10' :
                            insight.type === 'recommendation' ? 'bg-accent/10' :
                            'bg-primary/10'
                          }`}>
                            <div className={getTypeColor(insight.type)}>
                              {getTypeIcon(insight.type)}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(insight.type)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>
                            {insight.impact === 'high' ? 'Alto' : 
                             insight.impact === 'medium' ? 'Médio' : 'Baixo'} Impacto
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {insight.description}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {insight.timeframe}
                          </span>
                          <span className="text-muted-foreground">
                            Confiança: {insight.confidence}%
                          </span>
                        </div>
                        
                        {insight.metrics && (
                          <div className="text-right">
                            <span className="font-medium">
                              {insight.metrics.current} → {insight.metrics.predicted} {insight.metrics.unit}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress bar for confidence */}
                      <Progress value={insight.confidence} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed View */}
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Detalhes do Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedInsight ? (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          selectedInsight.type === 'alert' ? 'bg-destructive/10' :
                          selectedInsight.type === 'opportunity' ? 'bg-success/10' :
                          selectedInsight.type === 'recommendation' ? 'bg-accent/10' :
                          'bg-primary/10'
                        }`}>
                          <div className={getTypeColor(selectedInsight.type)}>
                            {getTypeIcon(selectedInsight.type)}
                          </div>
                        </div>
                        <div>
                          <Badge variant="outline">{getTypeLabel(selectedInsight.type)}</Badge>
                          <h3 className="font-semibold mt-1">{selectedInsight.title}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-medium mb-2">Análise Detalhada</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedInsight.description}
                      </p>
                    </div>

                    {/* Metrics */}
                    {selectedInsight.metrics && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Métricas</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Atual</p>
                            <p className="text-lg font-semibold">
                              {selectedInsight.metrics.current} {selectedInsight.metrics.unit}
                            </p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Previsto</p>
                            <p className="text-lg font-semibold">
                              {selectedInsight.metrics.predicted} {selectedInsight.metrics.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confidence & Impact */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Confiabilidade</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confiança do Modelo</span>
                          <span className="font-medium">{selectedInsight.confidence}%</span>
                        </div>
                        <Progress value={selectedInsight.confidence} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Impacto</span>
                        <Badge 
                          variant={selectedInsight.impact === 'high' ? 'destructive' : 
                                  selectedInsight.impact === 'medium' ? 'default' : 'secondary'}
                        >
                          {selectedInsight.impact === 'high' ? 'Alto' : 
                           selectedInsight.impact === 'medium' ? 'Médio' : 'Baixo'}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    {selectedInsight.actionable && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Ações Recomendadas</h4>
                        <div className="space-y-2">
                          <Button className="w-full justify-start" variant="default">
                            <Target className="h-4 w-4 mr-2" />
                            Implementar Ação
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Solicitar Mais Detalhes
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Category & Timeline */}
                    <div className="pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Categoria:</span>
                          <p className="font-medium">{selectedInsight.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prazo:</span>
                          <p className="font-medium">{selectedInsight.timeframe}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Selecione um insight para ver os detalhes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsights;