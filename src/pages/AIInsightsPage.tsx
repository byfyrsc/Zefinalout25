import AIInsights from "@/components/advanced/AIInsights";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const AIInsightsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Insights de IA</h1>
      <p className="text-muted-foreground">Análises preditivas e recomendações inteligentes geradas por IA</p>
      <AIInsights />
    </div>
  );
};

export default AIInsightsPage;