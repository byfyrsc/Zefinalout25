import { NPSEngine } from "@/components/feedback/NPSEngine";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";
import { Target } from "lucide-react";

const NPSEnginePage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Target className="h-6 w-6 text-primary" />
        NPS Engine
      </h1>
      <p className="text-muted-foreground">
        Acompanhe e analise seu Net Promoter Score em tempo real para entender a lealdade do cliente.
      </p>
      <NPSEngine showFilters={true} showBenchmarks={true} />
    </div>
  );
};

export default NPSEnginePage;