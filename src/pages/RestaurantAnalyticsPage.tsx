import RestaurantAnalytics from "@/components/restaurant/RestaurantAnalytics";
import { useTenant } from "@/contexts/TenantContext";
import { mockFeedback } from "@/data/mockData";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const RestaurantAnalyticsPage = () => {
  const { currentRestaurant } = useTenant();

  if (!currentRestaurant) {
    return <SkeletonPresets.Dashboard />;
  }

  const restaurantFeedback = mockFeedback.filter(f => f.restaurantId === currentRestaurant.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics do Restaurante</h1>
      <p className="text-muted-foreground">Análise de desempenho e satisfação para {currentRestaurant.name}</p>
      <RestaurantAnalytics feedbacks={restaurantFeedback} restaurant={currentRestaurant} />
    </div>
  );
};

export default RestaurantAnalyticsPage;