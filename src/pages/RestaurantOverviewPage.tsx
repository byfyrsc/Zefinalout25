import { useMemo } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useQuery } from "@tanstack/react-query"; // Importar useQuery
import { feedbackService } from "@/lib/supabase-services"; // Importar feedbackService

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
  const { currentLocation } = useTenant(); // Alterado para currentLocation

  // Buscar feedbacks reais para a localização atual
  const { data: feedbacks, isLoading: isFeedbacksLoading, error: feedbacksError } = useQuery({
    queryKey: ['feedbacks', currentLocation?.id],
    queryFn: () => feedbackService.getAll(currentLocation?.id),
    enabled: !!currentLocation?.id, // Habilitar query apenas se houver currentLocation.id
  });

  // Processamento de dados memorizado
  const { averageRating, totalFeedback, recentFeedback } = useMemo(() => {
    if (!feedbacks || feedbacks.length === 0) {
      return { averageRating: 0, totalFeedback: 0, recentFeedback: 0 };
    }
    const avgRating = feedbacks.reduce((sum, f) => sum + f.overall_rating, 0) / feedbacks.length;
    const total = feedbacks.length;
    const recent = feedbacks.filter(f => new Date(f.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    return { averageRating: avgRating, totalFeedback: total, recentFeedback: recent };
  }, [feedbacks]);

  if (!currentLocation || isFeedbacksLoading) { // Alterado para currentLocation e isFeedbacksLoading
    return <SkeletonPresets.Dashboard />;
  }

  if (feedbacksError) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive-foreground">Erro ao carregar feedbacks: {feedbacksError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard da Localização</h1> {/* Alterado para Localização */}
      <p className="text-muted-foreground">Visão geral e métricas principais para {currentLocation.name}</p> {/* Alterado para currentLocation.name */}
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