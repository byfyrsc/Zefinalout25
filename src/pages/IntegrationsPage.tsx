import { IntegrationsManager } from "@/components/integrations/IntegrationsManager";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";
import { Plug } from "lucide-react";

const IntegrationsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Plug className="h-6 w-6 text-primary" />
        Integrações
      </h1>
      <p className="text-muted-foreground">
        Conecte o DigaZÉ com seus sistemas de ponto de venda, CRM, delivery e redes sociais.
      </p>
      <IntegrationsManager />
    </div>
  );
};

export default IntegrationsPage;