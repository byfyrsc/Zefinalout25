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
  MessageCircle, // Re-added for communication
  Brain, // Novo ícone para AI Insights
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  requiresRestaurant?: boolean; // Indica se este item de navegação requer um restaurante selecionado
}

export const mainNavigationItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard", requiresRestaurant: true },
  { id: "feedback", label: "Feedbacks", icon: MessageSquare, path: "/feedback", badge: 3, requiresRestaurant: true },
  { id: "qrcode", label: "QR Code", icon: QrCode, path: "/qrcode", requiresRestaurant: true },
  { id: "restaurant-analytics", label: "Restaurant Analytics", icon: BarChart3, path: "/restaurant-analytics", requiresRestaurant: true },
  { id: "advanced-analytics", label: "Advanced Analytics", icon: Sparkles, path: "/advanced-analytics" },
  { id: "ai-insights", label: "AI Insights", icon: Brain, path: "/ai-insights" }, // Novo item de navegação
  { id: "campaigns", label: "Campaigns", icon: Gift, path: "/campaigns" },
  { id: "events", label: "Events", icon: Calendar, path: "/events" },
  { id: "gamification", label: "Gamification", icon: Users, path: "/gamification" },
  { id: "communication", label: "Communication Hub", icon: MessageCircle, path: "/communication" },
  { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  { id: "billing", label: "Billing", icon: CreditCard, path: "/billing" },
  { id: "restaurant-settings", label: "Restaurant Settings", icon: Settings, path: "/restaurant-settings", requiresRestaurant: true },
  { id: "profile", label: "User Profile", icon: Users, path: "/profile" },
  { id: "accessibility", label: "Accessibility", icon: Eye, path: "/accessibility" },
];