import CampaignDashboard from "@/components/campaigns/CampaignDashboard";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const CampaignsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Campanhas de Marketing</h1>
      <p className="text-muted-foreground">Gerencie suas campanhas de engajamento e automação</p>
      <CampaignDashboard />
    </div>
  );
};

export default CampaignsPage;