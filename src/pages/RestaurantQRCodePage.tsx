import QRCodeGenerator from "@/components/restaurant/QRCodeGenerator";
import { useTenant } from "@/contexts/TenantContext";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const RestaurantQRCodePage = () => {
  const { currentRestaurant } = useTenant();

  if (!currentRestaurant) {
    return <SkeletonPresets.Dashboard />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Gerador de QR Code</h1>
      <p className="text-muted-foreground">Crie e gerencie QR Codes para coletar feedback em {currentRestaurant.name}</p>
      <QRCodeGenerator restaurant={currentRestaurant} />
    </div>
  );
};

export default RestaurantQRCodePage;