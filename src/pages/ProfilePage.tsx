import { UserProfile } from "@/components/auth/UserProfile";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
      <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações de segurança</p>
      <UserProfile />
    </div>
  );
};

export default ProfilePage;