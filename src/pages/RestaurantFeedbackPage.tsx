import FeedbackList from "@/components/restaurant/FeedbackList";
import { useTenant } from "@/contexts/TenantContext";
import { mockFeedback } from "@/data/mockData";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const RestaurantFeedbackPage = () => {
  const { currentRestaurant } = useTenant();

  if (!currentRestaurant) {
    return <SkeletonPresets.Dashboard />;
  }

  const restaurantFeedback = mockFeedback.filter(f => f.restaurantId === currentRestaurant.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Feedbacks do Restaurante</h1>
      <p className="text-muted-foreground">Todos os feedbacks recebidos para {currentRestaurant.name}</p>
      <FeedbackList feedbacks={restaurantFeedback} />
    </div>
  );
};

export default RestaurantFeedbackPage;