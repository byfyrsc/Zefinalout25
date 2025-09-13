import AdvancedAnalytics from "@/components/advanced/AdvancedAnalytics";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const AdvancedAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics Avançado</h1>
      <p className="text-muted-foreground">Análise detalhada e insights preditivos para otimizar seu negócio</p>
      <AdvancedAnalytics />
    </div>
  );
};

export default AdvancedAnalyticsPage;