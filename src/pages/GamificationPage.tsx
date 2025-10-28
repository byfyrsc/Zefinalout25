import GamificationDashboard from "@/components/gamification/GamificationDashboard";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const GamificationPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Gamificação</h1>
      <p className="text-muted-foreground">Acompanhe o desempenho dos seus clientes no sistema de pontos e badges</p>
      <GamificationDashboard />
    </div>
  );
};

export default GamificationPage;