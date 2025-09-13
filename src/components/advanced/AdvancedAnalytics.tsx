import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Star,
  Calendar,
  Download,
  Filter,
  Clock,
  MapPin,
  Utensils,
} from "lucide-react";

// Mock data expandido para analytics avançado
const hourlyTrend = [
  { hour: "08:00", satisfaction: 4.2, responses: 12, sentiment: 0.8 },
  { hour: "09:00", satisfaction: 4.3, responses: 18, sentiment: 0.82 },
  { hour: "10:00", satisfaction: 4.1, responses: 24, sentiment: 0.78 },
  { hour: "11:00", satisfaction: 4.4, responses: 32, sentiment: 0.85 },
  { hour: "12:00", satisfaction: 3.9, responses: 68, sentiment: 0.72 },
  { hour: "13:00", satisfaction: 3.8, responses: 84, sentiment: 0.69 },
  { hour: "14:00", satisfaction: 4.0, responses: 52, sentiment: 0.75 },
  { hour: "15:00", satisfaction: 4.2, responses: 28, sentiment: 0.81 },
  { hour: "16:00", satisfaction: 4.3, responses: 35, sentiment: 0.83 },
  { hour: "17:00", satisfaction: 4.1, responses: 42, sentiment: 0.77 },
  { hour: "18:00", satisfaction: 3.7, responses: 89, sentiment: 0.65 },
  { hour: "19:00", satisfaction: 3.9, responses: 112, sentiment: 0.71 },
  { hour: "20:00", satisfaction: 4.0, responses: 98, sentiment: 0.74 },
  { hour: "21:00", satisfaction: 4.2, responses: 67, sentiment: 0.79 },
  { hour: "22:00", satisfaction: 4.4, responses: 32, sentiment: 0.86 },
];

const categoryPerformance = [
  { category: "Comida", score: 4.5, reviews: 1247, trend: "+0.2" },
  { category: "Atendimento", score: 4.2, reviews: 1156, trend: "+0.1" },
  { category: "Ambiente", score: 4.0, reviews: 892, trend: "-0.1" },
  { category: "Preço", score: 3.8, reviews: 743, trend: "+0.3" },
  { category: "Localização", score: 4.3, reviews: 567, trend: "0.0" },
  { category: "Limpeza", score: 4.6, reviews: 1023, trend: "+0.1" },
];

const sentimentDistribution = [
  { name: "Muito Positivo", value: 45, color: "hsl(var(--success))" },
  { name: "Positivo", value: 28, color: "hsl(var(--success) / 0.7)" },
  { name: "Neutro", value: 18, color: "hsl(var(--muted-foreground))" },
  { name: "Negativo", value: 7, color: "hsl(var(--warning))" },
  { name: "Muito Negativo", value: 2, color: "hsl(var(--destructive))" },
];

const competitorComparison = [
  { metric: "Satisfação Geral", nossa: 4.2, concorrente1: 3.8, concorrente2: 4.0 },
  { metric: "Velocidade", nossa: 4.0, concorrente1: 4.2, concorrente2: 3.7 },
  { metric: "Qualidade", nossa: 4.5, concorrente1: 4.1, concorrente2: 4.3 },
  { metric: "Preço", nossa: 3.8, concorrente1: 4.0, concorrente2: 3.5 },
  { metric: "Atendimento", nossa: 4.3, concorrente1: 3.9, concorrente2: 4.1 },
  { metric: "Ambiente", nossa: 4.1, concorrente1: 3.6, concorrente2: 4.2 },
];

const AdvancedAnalytics = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("satisfaction");

  const exportReport = () => {
    // Simulação de exportação
    console.log("Exportando relatório...");
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Avançado</h2>
          <p className="text-muted-foreground">Análise detalhada do desempenho do restaurante</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sentiment">Sentimento</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {/* Métricas por hora */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Tendências por Horário
                </CardTitle>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satisfaction">Satisfação</SelectItem>
                    <SelectItem value="responses">Respostas</SelectItem>
                    <SelectItem value="sentiment">Sentimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak Hours Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Melhor Horário</p>
                    <p className="font-semibold">22:00 - 4.4★</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pico de Movimento</p>
                    <p className="font-semibold">19:00 - 112 respostas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Atenção</p>
                    <p className="font-semibold">18:00 - 3.7★</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance por categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                Performance por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium w-24">{item.category}</div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold">{item.score}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.reviews} avaliações
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        item.trend.startsWith('+') ? 'text-success' : 
                        item.trend.startsWith('-') ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {item.trend}
                      </span>
                      {item.trend.startsWith('+') && <TrendingUp className="h-4 w-4 text-success" />}
                      {item.trend.startsWith('-') && <TrendingDown className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição de Sentimento */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Sentimento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {sentimentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análise de Sentimento Detalhada */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                    <span className="font-medium text-success">Sentimento Positivo</span>
                    <span className="text-2xl font-bold text-success">73%</span>
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Principais temas positivos:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Comida saborosa</Badge>
                      <Badge variant="outline">Atendimento rápido</Badge>
                      <Badge variant="outline">Ambiente acolhedor</Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Pontos de melhoria:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-warning text-warning">Tempo de espera</Badge>
                      <Badge variant="outline" className="border-warning text-warning">Preços altos</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {/* Comparação com Concorrentes */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação com Concorrentes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Análise baseada em dados públicos de avaliação
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={competitorComparison}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar
                    name="Nosso Restaurante"
                    dataKey="nossa"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                  <Radar
                    name="Concorrente A"
                    dataKey="concorrente1"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary) / 0.1)"
                    strokeWidth={2}
                  />
                  <Radar
                    name="Concorrente B"
                    dataKey="concorrente2"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent) / 0.1)"
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm">Nosso Restaurante</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="text-sm">Concorrente A</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-sm">Concorrente B</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;