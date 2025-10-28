import AnalyticsCharts from "@/components/AnalyticsCharts";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const GeneralAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics Gerais</h1>
      <p className="text-muted-foreground">Visão geral das métricas de satisfação e feedback do seu negócio.</p>
      <AnalyticsCharts />
    </div>
  );
};

export default GeneralAnalyticsPage;