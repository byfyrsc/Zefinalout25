import {
  Home,
  BarChart3,
  MessageSquare,
  Settings,
  QrCode,
  Eye,
  CreditCard,
  Sparkles,
  Users,
  Gift,
  Calendar,
  FileText,
  X,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { NavItem } from "./navigationConfig"; // Importa o tipo NavItem
import { Location } from "@/types/tenant"; // Importar o tipo Location

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigationItems: NavItem[];
  activeView: string; // Agora representa o ID do item de navegação ativo
  onBackToLocations: () => void; // Alterado para onBackToLocations
  currentLocation: Location | null; // Adicionado currentLocation como prop
}

export function Sidebar({
  isSidebarOpen,
  setSidebarOpen,
  navigationItems,
  activeView,
  onBackToLocations, // Alterado para onBackToLocations
  currentLocation, // Recebido como prop
}: SidebarProps) {
  const { currentTenant } = useTenant(); // Removido currentLocation do useTenant
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (item: NavItem) => {
    navigate(item.path);
    // Fecha a barra lateral no mobile após a navegação
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Filtra os itens de navegação com base na seleção de uma localização
  const filteredNavigationItems = navigationItems.filter(item =>
    !item.requiresLocation || currentLocation
  );

  return (
    <>
      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Barra lateral */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Cabeçalho da barra lateral */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">DigaZÉ</h1>
              {currentLocation && ( // Alterado para currentLocation
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {currentLocation.name}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {filteredNavigationItems.map((item) => { // Usar filteredNavigationItems
              const Icon = item.icon;
              // Determina se o item atual está ativo com base no seu ID correspondente à activeView
              const isActive = activeView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={cn(
                        "ml-auto h-5 min-w-[1.25rem] rounded-full px-1.5 text-xs font-medium leading-none",
                        isActive
                          ? "bg-primary-foreground text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rodapé da barra lateral */}
        <div className="p-4 border-t border-border">
          {currentLocation && ( // Alterado para currentLocation
            <Button variant="ghost" onClick={onBackToLocations} className="w-full justify-start mb-2"> {/* Alterado para onBackToLocations */}
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ver Localizações
            </Button>
          )}
          {/* Perfil do usuário */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentTenant?.name || "No tenant"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}