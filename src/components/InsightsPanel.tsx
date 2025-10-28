import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  AlertCircle, 
  TrendingUp,
  Users,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";

interface Insight {
  id: string;
  type: "recommendation" | "alert" | "prediction" | "opportunity";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  confidence: number;
  category: string;
  actionable: boolean;
}

const mockInsights: Insight[] = [
  {
    id: "1",
    type: "alert",
    title: "Padrão Crítico Detectado",
    description: "IA detectou aumento de 40% em reclamações sobre ruído nos últimos 3 dias, principalmente entre 19h-21h.",
    impact: "high",
    confidence: 87,
    category: "Ambiente",
    actionable: true
  },
  {
    id: "2",
    type: "recommendation",
    title: "Oportunidade de Melhoria",
    description: "Clientes que aguardam mais de 15min têm 60% mais chance de dar nota baixa. Sugerimos sistema de fila virtual.",
    impact: "medium",
    confidence: 92,
    category: "Operação",
    actionable: true
  },
  {
    id: "3",
    type: "prediction",
    title: "Previsão de Demanda",
    description: "Baseado em padrões históricos, espera-se 25% mais movimento no próximo fim de semana.",
    impact: "medium",
    confidence: 78,
    category: "Planejamento",
    actionable: false
  },
  {
    id: "4",
    type: "opportunity",
    title: "Potencial de Crescimento",
    description: "Clientes que experimentam o prato especial têm 3x mais chance de retornar em 30 dias.",
    impact: "high",
    confidence: 95,
    category: "Menu",
    actionable: true
  }
];

const InsightsPanel = () => {
  const getTypeIcon = (type: Insight["type"]) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "recommendation":
        return <Target className="h-4 w-4 text-primary" />;
      case "prediction":
        return <TrendingUp className="h-4 w-4 text-secondary" />;
      case "opportunity":
        return <Star className="h-4 w-4 text-warning" />;
    }
  };

  const getTypeLabel = (type: Insight["type"]) => {
    switch (type) {
      case "alert":
        return "Alerta";
      case "recommendation":
        return "Recomendação";
      case "prediction":
        return "Previsão";
      case "opportunity":
        return "Oportunidade";
    }
  };

  const getTypeVariant = (type: Insight["type"]) => {
    switch (type) {
      case "alert":
        return "destructive" as const;
      case "recommendation":
        return "default" as const;
      case "prediction":
        return "secondary" as const;
      case "opportunity":
        return "outline" as const;
    }
  };

  const getImpactColor = (impact: Insight["impact"]) => {
    switch (impact) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-success";
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Insights Inteligentes
          <Badge variant="secondary" className="ml-auto">IA</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockInsights.map((insight) => (
            <div 
              key={insight.id} 
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(insight.type)}
                  <Badge variant={getTypeVariant(insight.type)} className="text-xs">
                    {getTypeLabel(insight.type)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {insight.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={getImpactColor(insight.impact)}>
                    {insight.impact === "high" ? "Alto" : insight.impact === "medium" ? "Médio" : "Baixo"} impacto
                  </span>
                  <span>•</span>
                  <span>{insight.confidence}% confiança</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>

              {insight.actionable && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Ação recomendada disponível</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Ver Ação
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Próxima análise em:</span>
            <div className="flex items-center gap-1 text-primary">
              <Clock className="h-4 w-4" />
              <span className="font-medium">2h 15min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;