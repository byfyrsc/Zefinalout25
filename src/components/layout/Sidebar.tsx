import { 
  Home, 
  BarChart3, 
  MessageCircle, 
  Settings,
  Users,
  CreditCard,
  Bell,
  FileText,
  Gift,
  Calendar,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  { id: "feedback", label: "Feedback", icon: MessageCircle, path: "/feedback", badge: 3 },
  { id: "customers", label: "Customers", icon: Users, path: "/customers" },
  { id: "campaigns", label: "Campaigns", icon: Gift, path: "/campaigns" },
  { id: "events", label: "Events", icon: Calendar, path: "/events" },
  { id: "billing", label: "Billing", icon: CreditCard, path: "/billing" },
  { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar({ isSidebarOpen, setSidebarOpen }: SidebarProps) {
  const { currentTenant, currentRestaurant } = useTenant();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">InteliFeed Hub</h1>
              {currentRestaurant && (
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {currentRestaurant.name}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground"
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

        {/* User profile */}
        <div className="p-4 border-t border-border">
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