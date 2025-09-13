import AdvancedCommunication from "@/components/advanced/AdvancedCommunication";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const CommunicationPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Central de Comunicação</h1>
      <p className="text-muted-foreground">Gerencie todos os seus canais de comunicação com clientes</p>
      <AdvancedCommunication />
    </div>
  );
};

export default CommunicationPage;