import { AccessibilitySettings } from "@/components/accessibility/AccessibilitySettings";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const AccessibilityPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configurações de Acessibilidade</h1>
      <p className="text-muted-foreground">Personalize a interface para suas necessidades de acessibilidade</p>
      <AccessibilitySettings />
    </div>
  );
};

export default AccessibilityPage;