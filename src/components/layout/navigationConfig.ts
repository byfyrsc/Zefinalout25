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
  MessageCircle,
  Brain,
  Target,
  Plug, // Novo ícone para Integrações
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  requiresLocation?: boolean; // Indica se este item de navegação requer uma localização selecionada
}

export const mainNavigationItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard", requiresLocation: true },
  { id: "feedback", label: "Feedbacks", icon: MessageSquare, path: "/feedback", badge: 3, requiresLocation: true },
  { id: "qrcode", label: "QR Code", icon: QrCode, path: "/qrcode", requiresLocation: true },
  { id: "location-analytics", label: "Location Analytics", icon: BarChart3, path: "/location-analytics", requiresLocation: true }, // Alterado para Location Analytics
  { id: "advanced-analytics", label: "Advanced Analytics", icon: Sparkles, path: "/advanced-analytics" },
  { id: "ai-insights", label: "AI Insights", icon: Brain, path: "/ai-insights" },
  { id: "general-analytics", label: "General Analytics", icon: BarChart3, path: "/general-analytics" },
  { id: "nps-engine", label: "NPS Engine", icon: Target, path: "/nps-engine" },
  { id: "campaigns", label: "Campaigns", icon: Gift, path: "/campaigns" },
  { id: "events", label: "Events", icon: Calendar, path: "/events" },
  { id: "gamification", label: "Gamification", icon: Users, path: "/gamification" },
  { id: "communication", label: "Communication Hub", icon: MessageCircle, path: "/communication" },
  { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  { id: "integrations", label: "Integrations", icon: Plug, path: "/integrations" }, // Novo item de navegação
  { id: "billing", label: "Billing", icon: CreditCard, path: "/billing" },
  { id: "location-settings", label: "Location Settings", icon: Settings, path: "/location-settings", requiresLocation: true }, // Alterado para Location Settings
  { id: "profile", label: "User Profile", icon: Users, path: "/profile" },
  { id: "accessibility", label: "Accessibility", icon: Eye, path: "/accessibility" },
];