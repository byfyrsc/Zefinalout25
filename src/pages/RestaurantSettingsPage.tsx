import RestaurantSettings from "@/components/restaurant/RestaurantSettings";
import { useTenant } from "@/contexts/TenantContext";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const RestaurantSettingsPage = () => {
  const { currentRestaurant } = useTenant();

  if (!currentRestaurant) {
    return <SkeletonPresets.Dashboard />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configurações do Restaurante</h1>
      <p className="text-muted-foreground">Gerencie as informações e preferências de {currentRestaurant.name}</p>
      <RestaurantSettings restaurant={currentRestaurant} />
    </div>
  );
};

export default RestaurantSettingsPage;