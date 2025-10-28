import RestaurantAnalytics from "@/components/restaurant/RestaurantAnalytics";
import { useTenant } from "@/contexts/TenantContext";
import { useQuery } from "@tanstack/react-query"; // Importar useQuery
import { feedbackService } from "@/lib/supabase-services"; // Importar feedbackService
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const RestaurantAnalyticsPage = () => {
  const { currentLocation } = useTenant(); // Alterado para currentLocation

  // Buscar feedbacks reais para a localização atual
  const { data: feedbacks, isLoading: isFeedbacksLoading, error: feedbacksError } = useQuery({
    queryKey: ['feedbacks', currentLocation?.id],
    queryFn: () => feedbackService.getAll(currentLocation?.id),
    enabled: !!currentLocation?.id, // Habilitar query apenas se houver currentLocation.id
  });

  if (!currentLocation || isFeedbacksLoading) { // Alterado para currentLocation e isFeedbacksLoading
    return <SkeletonPresets.Dashboard />;
  }

  if (feedbacksError) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive-foreground">Erro ao carregar analytics: {feedbacksError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics da Localização</h1> {/* Alterado para Localização */}
      <p className="text-muted-foreground">Análise de desempenho e satisfação para {currentLocation.name}</p> {/* Alterado para currentLocation.name */}
      <RestaurantAnalytics feedbacks={feedbacks || []} location={currentLocation} /> {/* Passar feedbacks e location reais */}
    </div>
  );
};

export default RestaurantAnalyticsPage;