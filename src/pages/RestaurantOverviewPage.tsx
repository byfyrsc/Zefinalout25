import { useMemo } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { mockFeedback } from "@/data/mockData";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

// Icons
import {
  Star,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";

const StatCard = ({ icon: Icon, title, value, description, iconColor }) => (
  <Card className="bg-background/70 backdrop-blur-sm border-border/20 hover:border-primary/40 transition-colors duration-300">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`p-3 rounded-full bg-primary/10 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const RestaurantOverviewPage = () => {
  const { currentRestaurant } = useTenant();

  // Processamento de dados memorizado
  const { restaurantFeedback, averageRating, totalFeedback, recentFeedback } = useMemo(() => {
    if (!currentRestaurant) {
      return { restaurantFeedback: [], averageRating: 0, totalFeedback: 0, recentFeedback: 0 };
    }
    const feedback = mockFeedback.filter(f => f.restaurantId === currentRestaurant.id);
    const avgRating = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0;
    const total = feedback.length;
    const recent = feedback.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    return { restaurantFeedback: feedback, averageRating: avgRating, totalFeedback: total, recentFeedback: recent };
  }, [currentRestaurant]);

  if (!currentRestaurant) {
    return <SkeletonPresets.Dashboard />; // Ou um estado de carregamento/vazio adequado para dados do restaurante
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard do Restaurante</h1>
      <p className="text-muted-foreground">Visão geral e métricas principais para {currentRestaurant.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard icon={MessageSquare} title="Total de Feedbacks" value={totalFeedback} description="Desde o início" iconColor="text-primary" />
        <StatCard icon={Star} title="Avaliação Média" value={`${averageRating.toFixed(1)}/5`} description="Média geral" iconColor="text-yellow-500" />
        <StatCard icon={TrendingUp} title="Feedbacks (7d)" value={recentFeedback} description="Na última semana" iconColor="text-green-500" />
      </div>
      {/* Você pode adicionar mais conteúdo de visão geral aqui */}
    </div>
  );
};

export default RestaurantOverviewPage;