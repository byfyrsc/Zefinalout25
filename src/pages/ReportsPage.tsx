import ReportExporter from "@/components/advanced/ReportExporter";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Exportar Relatórios</h1>
      <p className="text-muted-foreground">Configure e exporte relatórios personalizados de desempenho</p>
      <ReportExporter />
    </div>
  );
};

export default ReportsPage;