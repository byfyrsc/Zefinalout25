import { useState, useEffect, lazy, Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { cn } from "@/lib/utils"; // Correção: Adicionado 'from'
import { useTenant } from "@/contexts/TenantContext";
import { useResponsive } from "@/hooks/useResponsive";
import { PageTransition } from "@/components/ui/micro-interactions";
import { EnhancedSkeleton, SkeletonPresets } from "@/components/ui/enhanced-skeleton";
import { mainNavigationItems, NavItem } from "@/components/layout/navigationConfig";

// Lazy load main content components that are not directly rendered by Outlet
const TenantSelector = lazy(() => import("@/components/tenant/TenantSelector"));
const LocationSelector = lazy(() => import("@/components/tenant/RestaurantSelector")); // Alterado para LocationSelector

export function DashboardLayout() {
  const { currentTenant, currentLocation, setCurrentLocation } = useTenant(); // Alterado para currentLocation
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile); // Padrão: aberto no desktop, fechado no mobile

  useEffect(() => {
    // Ajusta a visibilidade da barra lateral em mudanças de mobile/desktop
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleBackToLocations = () => { // Alterado para handleBackToLocations
    setCurrentLocation(null); // Alterado para setCurrentLocation
    navigate('/dashboard'); // Navega de volta para a raiz do dashboard para mostrar o seletor de localizações
  };

  // Determina a visualização ativa para destaque da barra lateral com base no caminho atual
  const activeViewId = mainNavigationItems.find(item => item.path === location.pathname)?.id || 'dashboard';

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigationItems={mainNavigationItems} // Passar todos os itens, a Sidebar fará a filtragem
        activeView={activeViewId}
        onBackToLocations={handleBackToLocations} // Alterado para onBackToLocations
        currentLocation={currentLocation} // Passar currentLocation para a Sidebar
      />
      <div className="flex flex-col flex-1">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 py-6 pt-safe-top pb-safe-bottom">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <PageTransition>
              <Suspense fallback={<SkeletonPresets.Dashboard />}>
                {/* Renderiza TenantSelector ou LocationSelector se não estiverem selecionados */}
                {!currentTenant ? (
                  <TenantSelector />
                ) : !currentLocation && location.pathname !== '/dashboard' ? ( // Mostra o seletor apenas se não estiver na rota do dashboard
                  <LocationSelector /> // Alterado para LocationSelector
                ) : (
                  <Outlet /> 
                )}
              </Suspense>
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}