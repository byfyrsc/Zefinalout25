import LocationSettings from "@/components/restaurant/RestaurantSettings"; // Alterado para LocationSettings
import { useTenant } from "@/contexts/TenantContext";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const RestaurantSettingsPage = () => {
  const { currentLocation } = useTenant(); // Alterado para currentLocation

  if (!currentLocation) { // Alterado para currentLocation
    return <SkeletonPresets.Dashboard />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configurações da Localização</h1> {/* Alterado para Localização */}
      <p className="text-muted-foreground">Gerencie as informações e preferências de {currentLocation.name}</p> {/* Alterado para currentLocation.name */}
      <LocationSettings location={currentLocation} /> {/* Passar location real */}
    </div>
  );
};

export default RestaurantSettingsPage;