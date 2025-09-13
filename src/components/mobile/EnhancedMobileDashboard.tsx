import { useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TouchButton } from "@/components/ui/touch-button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { StatCard } from "@/components/ui/stat-card";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { VirtualizedList } from "@/components/performance/VirtualizedList";
import { LazyImage } from "@/components/performance/LazyImage";
import { useResponsive } from "@/hooks/useResponsive";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { useNativeCapabilities } from "@/hooks/useNativeCapabilities";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  ArrowLeft,
  QrCode,
  Settings,
  BarChart3,
  Plus,
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";

const EnhancedMobileDashboard = () => {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const { isMobile } = useResponsive();
  const { currentRestaurant } = useTenant();
  const { toast } = useToast();
  
  // Native capabilities
  const { 
    isNative, 
    permissions, 
    hapticFeedback, 
    capturePhoto, 
    getCurrentLocation,
    requestNotificationPermission 
  } = useNativeCapabilities();
  
  // Offline sync
  const { 
    isOnline, 
    pendingActions, 
    isSyncing, 
    addOfflineAction, 
    syncPendingActions,
    pendingCount 
  } = useOfflineSync();

  // Sample data for virtualized list
  const feedbackData = Array.from({ length: 1000 }, (_, i) => ({
    id: `feedback-${i}`,
    customer: `Cliente ${i + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    comment: `Este é um comentário de exemplo número ${i + 1}. O feedback pode variar em tamanho dependendo do que o cliente escreveu.`,
    time: `Há ${Math.floor(Math.random() * 24)} horas`,
    restaurant: currentRestaurant?.name || "Restaurant"
  }));

  const stats = [
    {
      title: "Satisfação Geral",
      value: "4.7/5.0",
      change: "+0.3 vs mês anterior",
      changeType: "positive" as const,
      icon: Star,
      iconColor: "text-warning"
    },
    {
      title: "Respostas Hoje",
      value: "147",
      change: "+23% vs ontem",
      changeType: "positive" as const,
      icon: MessageCircle,
      iconColor: "text-secondary"
    },
    {
      title: "NPS Score",
      value: "+67",
      change: "Excelente zona",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconColor: "text-primary"
    },
    {
      title: "Clientes Ativos",
      value: "2,341",
      change: "+12% este mês",
      changeType: "positive" as const,
      icon: Users,
      iconColor: "text-accent"
    }
  ];

  const handleRefresh = async () => {
    await hapticFeedback('light');
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (isOnline) {
      await syncPendingActions();
    }
    toast({
      title: "Dashboard atualizado",
      description: isOnline ? "Dados sincronizados com sucesso" : "Modo offline - dados locais atualizados"
    });
  };

  const handleCapturePhoto = async () => {
    try {
      await hapticFeedback('medium');
      const photoUrl = await capturePhoto();
      toast({
        title: "Foto capturada",
        description: "Foto salva com sucesso"
      });
      // Handle photo upload/processing
    } catch (error) {
      toast({
        title: "Erro na câmera",
        description: "Não foi possível capturar a foto",
        variant: "destructive"
      });
    }
  };

  const handleGetLocation = async () => {
    try {
      await hapticFeedback('light');
      const location = await getCurrentLocation();
      toast({
        title: "Localização obtida",
        description: `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`
      });
    } catch (error) {
      toast({
        title: "Erro de localização",
        description: "Não foi possível obter a localização",
        variant: "destructive"
      });
    }
  };

  const handleAddFeedback = () => {
    const newFeedback = {
      type: 'feedback' as const,
      data: {
        customer: "Cliente Offline",
        rating: 5,
        comment: "Feedback adicionado offline",
        restaurantId: currentRestaurant?.id
      }
    };

    addOfflineAction(newFeedback);
    hapticFeedback('medium');
    toast({
      title: "Feedback salvo",
      description: isOnline ? "Enviado com sucesso" : "Salvo para sincronização"
    });
  };

  const swipeRef = useSwipeGestures({
    onSwipeLeft: () => {
      hapticFeedback('light');
      if (activeTab === "dashboard") setActiveTab("analytics");
      else if (activeTab === "analytics") setActiveTab("feedback");
      else if (activeTab === "feedback") setActiveTab("settings");
    },
    onSwipeRight: () => {
      hapticFeedback('light');
      if (activeTab === "settings") setActiveTab("feedback");
      else if (activeTab === "feedback") setActiveTab("analytics");
      else if (activeTab === "analytics") setActiveTab("dashboard");
    }
  });

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Enhanced Header with connectivity status */}
      <div className="flex items-center gap-3 mb-4">
        <TouchButton
          variant="ghost"
          size="icon"
          onClick={() => {
            hapticFeedback('light');
            window.history.back();
          }}
          haptic="light"
        >
          <ArrowLeft className="h-5 w-5" />
        </TouchButton>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            {currentRestaurant?.name || "Restaurant"}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard Analytics</span>
            {isNative && (
              <>
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-success" />
                ) : (
                  <WifiOff className="h-3 w-3 text-destructive" />
                )}
                {pendingCount > 0 && (
                  <span className="text-warning">({pendingCount} pendentes)</span>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Native capabilities buttons */}
        {isNative && (
          <div className="flex gap-2">
            {permissions.camera && (
              <TouchButton
                variant="ghost"
                size="icon"
                onClick={handleCapturePhoto}
                haptic="medium"
              >
                <Camera className="h-4 w-4" />
              </TouchButton>
            )}
            {permissions.location && (
              <TouchButton
                variant="ghost"
                size="icon"
                onClick={handleGetLocation}
                haptic="light"
              >
                <MapPin className="h-4 w-4" />
              </TouchButton>
            )}
            {isSyncing && (
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
        )}
      </div>

      {/* Enhanced stats with lazy images */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {stats.map((stat, index) => (
          <div key={index} className="flex-shrink-0 w-64">
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Performance optimized recent feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Feedback Recente
            {isNative && !isOnline && (
              <span className="text-xs text-muted-foreground">Modo Offline</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <VirtualizedList
              items={feedbackData.slice(0, 50)} // Show first 50 for demo
              estimateSize={120}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Analytics Avançado</h2>
            <Card>
              <CardContent className="pt-6">
                <LazyImage
                  src="/placeholder.svg"
                  alt="Analytics Chart"
                  className="w-full h-48 rounded-lg"
                  placeholder={<div className="w-full h-48 bg-muted rounded-lg animate-pulse" />}
                />
                <p className="text-muted-foreground mt-4">Gráficos detalhados de performance com PWA cache...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "feedback":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Feedback Virtualizado</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="h-96">
                  <VirtualizedList
                    items={feedbackData}
                    estimateSize={120}
                    hasNextPage={true}
                    onLoadMore={() => {
                      hapticFeedback('light');
                      // Simulate loading more data
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Configurações Nativas</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Permissões</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Câmera:</span>
                      <span className={permissions.camera ? "text-success" : "text-destructive"}>
                        {permissions.camera ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Localização:</span>
                      <span className={permissions.location ? "text-success" : "text-destructive"}>
                        {permissions.location ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notificações:</span>
                      <span className={permissions.notifications ? "text-success" : "text-destructive"}>
                        {permissions.notifications ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {!permissions.notifications && (
                  <TouchButton
                    onClick={requestNotificationPermission}
                    className="w-full"
                    haptic="medium"
                  >
                    Ativar Notificações
                  </TouchButton>
                )}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="max-w-7xl mx-auto">
          {renderDashboardContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PullToRefresh onRefresh={handleRefresh}>
        <div 
          ref={swipeRef}
          className="px-4 py-6 min-h-screen"
        >
          {renderContent()}
        </div>
      </PullToRefresh>

      {/* Enhanced FAB with offline support */}
      <FloatingActionButton
        onClick={handleAddFeedback}
        icon={<Plus className="h-6 w-6" />}
        label={isOnline ? "Nova Pesquisa" : "Salvar Offline"}
        position="bottom-right"
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          hapticFeedback('light');
          setActiveTab(tab);
        }}
      />
    </div>
  );
};

export default EnhancedMobileDashboard;