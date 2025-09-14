import QRCodeGenerator from "@/components/restaurant/QRCodeGenerator";
import { useTenant } from "@/contexts/TenantContext";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const RestaurantQRCodePage = () => {
  const { currentLocation } = useTenant(); // Alterado para currentLocation

  if (!currentLocation) { // Alterado para currentLocation
    return <SkeletonPresets.Dashboard />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Gerador de QR Code</h1>
      <p className="text-muted-foreground">Crie e gerencie QR Codes para coletar feedback em {currentLocation.name}</p> {/* Alterado para currentLocation.name */}
      <QRCodeGenerator location={currentLocation} /> {/* Passar location real */}
    </div>
  );
};

export default RestaurantQRCodePage;