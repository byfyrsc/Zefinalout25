import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Feedback, Location } from "@/types/tenant"; // Alterado para Location
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  MessageSquare, 
  Calendar,
  Users,
  Target,
  Award
} from "lucide-react";

interface LocationAnalyticsProps { // Alterado para LocationAnalyticsProps
  feedbacks: Feedback[];
  location: Location; // Alterado para location
}

const RestaurantAnalytics = ({ feedbacks, location }: LocationAnalyticsProps) => { // Alterado para location
  const analytics = useMemo(() => {
    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating: `${rating} estrelas`,
      count: feedbacks.filter(f => f.rating === rating).length,
      percentage: Math.round((feedbacks.filter(f => f.rating === rating).length / feedbacks.length) * 100) || 0
    }));

    // Category analysis
    const categories = ['food', 'service', 'ambiance', 'price', 'overall'];
    const categoryAnalysis = categories.map(category => {
      const categoryFeedbacks = feedbacks.filter(f => f.category === category);
      const avgRating = categoryFeedbacks.length > 0 
        ? categoryFeedbacks.reduce((sum, f) => sum + f.rating, 0) / categoryFeedbacks.length 
        : 0;
      
      return {
        category: category,
        name: {
          food: 'Comida',
          service: 'Serviço', 
          ambiance: 'Ambiente',
          price: 'Preço',
          overall: 'Geral'
        }[category],
        count: categoryFeedbacks.length,
        avgRating: Number(avgRating.toFixed(1))
      };
    }).filter(item => item.count > 0);

    // Timeline data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayFeedbacks = feedbacks.filter(f => {
        const feedbackDate = new Date(f.createdAt);
        return feedbackDate.toDateString() === date.toDateString();
      });
      
      const avgRating = dayFeedbacks.length > 0 
        ? dayFeedbacks.reduce((sum, f) => sum + f.rating, 0) / dayFeedbacks.length 
        : 0;

      return {
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        count: dayFeedbacks.length,
        avgRating: Number(avgRating.toFixed(1))
      };
    });

    // General stats
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0 
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks 
      : 0;
    
    const positiveRating = feedbacks.filter(f => f.rating >= 4).length;
    const negativeRating = feedbacks.filter(f => f.rating <= 2).length;
    const anonymousFeedbacks = feedbacks.filter(f => f.isAnonymous).length;

    const last30Days = feedbacks.filter(f => {
      const feedbackDate = new Date(f.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return feedbackDate >= thirtyDaysAgo;
    });

    return {
      ratingDistribution,
      categoryAnalysis,
      last7Days,
      totalFeedbacks,
      averageRating: Number(averageRating.toFixed(1)),
      positiveRating,
      negativeRating,
      anonymousFeedbacks,
      last30DaysCount: last30Days.length
    };
  }, [feedbacks]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600'; 
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (score >= 3.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.averageRating)}`}>
                  {analytics.averageRating}/5
                </p>
              </div>
              <Star className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feedbacks</p>
                <p className="text-2xl font-bold text-secondary">{analytics.totalFeedbacks}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-secondary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliações Positivas</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.totalFeedbacks > 0 
                    ? Math.round((analytics.positiveRating / analytics.totalFeedbacks) * 100)
                    : 0
                  }%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
                <p className="text-2xl font-bold text-accent">{analytics.last30DaysCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card className="bg-gradient-to-br from-card to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Distribuição de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.totalFeedbacks > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.ratingDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ rating, percentage }) => `${rating}: ${percentage}%`}
                  >
                    {analytics.ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="bg-gradient-to-br from-card to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.categoryAnalysis.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.categoryAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} (${name === 'avgRating' ? 'Média' : 'Quantidade'})`,
                      name === 'avgRating' ? 'Avaliação Média' : 'Feedbacks'
                    ]}
                  />
                  <Bar dataKey="avgRating" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-gradient-to-br from-card to-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tendência dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.last7Days.some(day => day.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} ${name === 'count' ? 'feedbacks' : 'média'}`,
                    name === 'count' ? 'Quantidade' : 'Avaliação Média'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="count"
                />
                <Line 
                  type="monotone" 
                  dataKey="avgRating" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="avgRating"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum feedback nos últimos 7 dias
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{analytics.anonymousFeedbacks}</div>
            <div className="text-sm text-muted-foreground">Feedbacks Anônimos</div>
            <div className="text-xs text-muted-foreground mt-1">
              {analytics.totalFeedbacks > 0 
                ? `${Math.round((analytics.anonymousFeedbacks / analytics.totalFeedbacks) * 100)}% do total`
                : '0% do total'
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{analytics.negativeRating}</div>
            <div className="text-sm text-muted-foreground">Avaliações Baixas</div>
            <div className="text-xs text-muted-foreground mt-1">
              {analytics.totalFeedbacks > 0 
                ? `${Math.round((analytics.negativeRating / analytics.totalFeedbacks) * 100)}% do total`
                : '0% do total'
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <Badge className={getScoreBadge(analytics.averageRating)}>
              {analytics.averageRating >= 4.5 ? 'Excelente' : 
               analytics.averageRating >= 3.5 ? 'Bom' : 'Precisa Melhorar'}
            </Badge>
            <div className="text-sm text-muted-foreground mt-2">Status Geral</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantAnalytics;