import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Activity } from "lucide-react";

// Mock data
const satisfactionTrend = [
  { month: "Jan", score: 4.2, responses: 156 },
  { month: "Fev", score: 4.3, responses: 178 },
  { month: "Mar", score: 4.1, responses: 203 },
  { month: "Abr", score: 4.5, responses: 187 },
  { month: "Mai", score: 4.7, responses: 234 },
  { month: "Jun", score: 4.6, responses: 267 },
];

const categoryData = [
  { name: "Qualidade da Comida", value: 35, color: "hsl(var(--primary))" },
  { name: "Atendimento", value: 28, color: "hsl(var(--secondary))" },
  { name: "Ambiente", value: 18, color: "hsl(var(--accent))" },
  { name: "Preço", value: 12, color: "hsl(var(--warning))" },
  { name: "Tempo de Espera", value: 7, color: "hsl(var(--destructive))" },
];

const sentimentData = [
  { time: "06:00", positive: 12, neutral: 3, negative: 1 },
  { time: "09:00", positive: 24, neutral: 8, negative: 2 },
  { time: "12:00", positive: 45, neutral: 12, negative: 5 },
  { time: "15:00", positive: 32, neutral: 9, negative: 3 },
  { time: "18:00", positive: 67, neutral: 15, negative: 8 },
  { time: "21:00", positive: 78, neutral: 18, negative: 6 },
];

const npsData = [
  { category: "Promotores", value: 65, color: "hsl(var(--success))" },
  { category: "Neutros", value: 23, color: "hsl(var(--warning))" },
  { category: "Detratores", value: 12, color: "hsl(var(--destructive))" },
];

const AnalyticsCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Satisfaction Trend */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tendência de Satisfação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={satisfactionTrend}>
              <defs>
                <linearGradient id="satisfactionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                domain={[3.5, 5]} 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#satisfactionGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-secondary" />
            Categorias de Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value) => [`${value}%`, "Porcentagem"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Análise de Sentimento por Horário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill="hsl(var(--success))" name="Positivo" />
              <Bar dataKey="neutral" stackId="a" fill="hsl(var(--warning))" name="Neutro" />
              <Bar dataKey="negative" stackId="a" fill="hsl(var(--destructive))" name="Negativo" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* NPS Distribution */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Distribuição NPS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={npsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                type="category" 
                dataKey="category" 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value) => [`${value}%`, "Porcentagem"]}
              />
              <Bar dataKey="value">
                {npsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;