import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import NotificationCenter from "@/components/NotificationCenter";
import InsightsPanel from "@/components/InsightsPanel";
import { 
  TrendingUp, 
  Users, 
  Star, 
  MessageCircle, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Brain,
  Filter
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Analytics</h1>
            <p className="text-muted-foreground">Insights em tempo real do seu restaurante</p>
          </div>
          <div className="flex items-center space-x-3">
            <NotificationCenter />
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline">Exportar Relatório</Button>
            <Button variant="default">Nova Pesquisa</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Satisfação Geral"
            value="4.7/5.0"
            change="+0.3 vs mês anterior"
            changeType="positive"
            icon={Star}
            iconColor="text-warning"
          />
          <StatCard
            title="Respostas Hoje"
            value="147"
            change="+23% vs ontem"
            changeType="positive"
            icon={MessageCircle}
            iconColor="text-secondary"
          />
          <StatCard
            title="NPS Score"
            value="+67"
            change="Excelente zona"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-primary"
          />
          <StatCard
            title="Clientes Ativos"
            value="2,341"
            change="+12% este mês"
            changeType="positive"
            icon={Users}
            iconColor="text-accent"
          />
        </div>

        {/* Charts and Analytics */}
        <AnalyticsCharts />

        {/* Insights Panel */}
        <InsightsPanel />

        {/* Recent Feedback */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Feedback Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: 1, 
                  customer: "Ana Silva", 
                  rating: 5, 
                  comment: "Atendimento excepcional! A comida estava deliciosa.",
                  status: "positive",
                  time: "Há 2 horas"
                },
                { 
                  id: 2, 
                  customer: "João Santos", 
                  rating: 4, 
                  comment: "Boa experiência geral, mas o tempo de espera foi um pouco longo.",
                  status: "neutral",
                  time: "Há 4 horas"
                },
                { 
                  id: 3, 
                  customer: "Maria Costa", 
                  rating: 2, 
                  comment: "O prato veio frio e o atendimento foi lento.",
                  status: "negative",
                  time: "Há 6 horas"
                }
              ].map((feedback) => (
                <div key={feedback.id} className="flex items-start space-x-4 p-4 bg-card/50 rounded-lg border">
                  <div className="flex-shrink-0">
                    {feedback.status === 'positive' && <CheckCircle className="h-5 w-5 text-success" />}
                    {feedback.status === 'neutral' && <MessageCircle className="h-5 w-5 text-warning" />}
                    {feedback.status === 'negative' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{feedback.customer}</p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < feedback.rating ? 'text-warning fill-current' : 'text-muted'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{feedback.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">{feedback.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;