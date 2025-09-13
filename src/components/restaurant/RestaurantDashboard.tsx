import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useResponsive } from "@/hooks/useResponsive";
import { mockFeedback } from "@/data/mockData";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { PageTransition } from "@/components/ui/micro-interactions";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";

// Icons
import { 
  ArrowLeft, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  QrCode,
  BarChart3,
  Eye,
  CreditCard,
  Sparkles
} from "lucide-react";

// Lazy load heavy components to improve initial load performance and prevent unnecessary imports
const Billing = lazy(() => import("@/pages/Billing").then(module => ({ default: module.Billing })));
const RestaurantAnalytics = lazy(() => import("./RestaurantAnalytics"));
const QRCodeGenerator = lazy(() => import("./QRCodeGenerator"));
const RestaurantSettings = lazy(() => import("./RestaurantSettings"));

// Always-loaded lightweight components
import FeedbackList from "./FeedbackList";
import { AccessibilitySettings } from "@/components/accessibility/AccessibilitySettings";

// Type for navigation items
type NavItem = 'dashboard' | 'feedback' | 'qrcode' | 'analytics' | 'billing' | 'settings' | 'accessibility';

const StatCard = ({ icon: Icon, title, value, description, iconColor }) => (
  <Card className="bg-background/70 backdrop-blur-sm border-border/20 hover:border-primary/40 transition-colors duration-300">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className={`p-3 rounded-full bg-primary/10 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const RestaurantDashboard = () => {
  const { currentTenant, currentRestaurant, setCurrentRestaurant } = useTenant();
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<NavItem>('dashboard');

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Memoized data processing
  const { restaurantFeedback, averageRating, totalFeedback, recentFeedback } = useMemo(() => {
    if (!currentRestaurant) {
      return { restaurantFeedback: [], averageRating: 0, totalFeedback: 0, recentFeedback: 0 };
    }
    const feedback = mockFeedback.filter(f => f.restaurantId === currentRestaurant.id);
    const avgRating = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0;
    const total = feedback.length;
    const recent = feedback.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    return { restaurantFeedback: feedback, averageRating: avgRating, totalFeedback: total, recentFeedback: recent };
  }, [currentRestaurant]);

  const handleBackToRestaurants = () => setCurrentRestaurant(null);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'feedback', label: 'Feedbacks', icon: MessageSquare },
    { id: 'qrcode', label: 'QR Code', icon: QrCode },
    { id: 'analytics', label: 'Analytics Avançada', icon: Sparkles },
    { id: 'billing', label: 'Faturamento', icon: CreditCard },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'accessibility', label: 'Acessibilidade', icon: Eye },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'feedback':
        return <FeedbackList feedbacks={restaurantFeedback} />;
      case 'qrcode':
        return (
          <Suspense fallback={<SkeletonPresets.Dashboard />}>
            <QRCodeGenerator restaurant={currentRestaurant} />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<SkeletonPresets.Dashboard />}>
            <RestaurantAnalytics feedbacks={restaurantFeedback} restaurant={currentRestaurant} />
          </Suspense>
        );
      case 'billing':
        return (
          <Suspense fallback={<SkeletonPresets.Dashboard />}>
            <Billing />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<SkeletonPresets.Dashboard />}>
            <RestaurantSettings restaurant={currentRestaurant} />
          </Suspense>
        );
      case 'accessibility':
        return <AccessibilitySettings />;
      case 'dashboard':
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCard icon={MessageSquare} title="Total de Feedbacks" value={totalFeedback} description="Desde o início" iconColor="text-primary" />
            <StatCard icon={Star} title="Avaliação Média" value={`${averageRating.toFixed(1)}/5`} description="Média geral" iconColor="text-yellow-500" />
            <StatCard icon={TrendingUp} title="Feedbacks (7d)" value={recentFeedback} description="Na última semana" iconColor="text-green-500" />
          </div>
        );
    }
  };

  if (isLoading) {
    return <SkeletonPresets.Dashboard />;
  }

  if (!currentTenant || !currentRestaurant) return null; // Or a proper empty state

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2 pr-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">DigaZÉ</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveView(item.id as NavItem)}
                    isActive={activeView === item.id}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
             <Button variant="ghost" onClick={handleBackToRestaurants} className="w-full justify-start">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ver Restaurantes
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
            {/* Main Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex-1">
                    <h1 className="text-lg font-semibold md:text-xl text-foreground">
                        {currentRestaurant.name}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {currentTenant.name}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    </Badge>
                    <Badge variant={currentRestaurant.isActive ? "default" : "secondary"} className="capitalize">
                        {currentRestaurant.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6">
                <PageTransition>
                    {renderContent()}
                </PageTransition>
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RestaurantDashboard;