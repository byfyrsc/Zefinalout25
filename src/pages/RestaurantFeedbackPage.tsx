import FeedbackList from "@/components/restaurant/FeedbackList";
import { useTenant } from "@/contexts/TenantContext";
import { useQuery } from "@tanstack/react-query"; // Importar useQuery
import { feedbackService } from "@/lib/supabase-services"; // Importar feedbackService
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const RestaurantFeedbackPage = () => {
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
        <p className="text-destructive-foreground">Erro ao carregar feedbacks: {feedbacksError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Feedbacks da Localização</h1> {/* Alterado para Localização */}
      <p className="text-muted-foreground">Todos os feedbacks recebidos para {currentLocation.name}</p> {/* Alterado para currentLocation.name */}
      <FeedbackList feedbacks={feedbacks || []} /> {/* Passar feedbacks reais */}
    </div>
  );
};

export default RestaurantFeedbackPage;