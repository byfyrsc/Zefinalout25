import { lazy } from "react";

import { ProtectedRoute } from "@/routes/components/Protected";
import { DashboardLayout } from "@/pages/DashboardLayout";

const Index = lazy(() => import("@/pages/Index")); // Este é o seletor de inquilino/localização

// Páginas de faturamento (são páginas completas, não sub-visualizações de um componente de dashboard)
const BillingPage = lazy(() => import("@/pages/Billing").then((module) => ({ default: module.Billing })));
const BillingSuccessPage = lazy(() => import("@/pages/Billing").then((module) => ({ default: module.BillingSuccess })));
const BillingCancelPage = lazy(() => import("@/pages/Billing").then((module) => ({ default: module.BillingCancel })));

// Novos componentes de página para várias visualizações do dashboard
const RestaurantOverviewPage = lazy(() => import("@/pages/RestaurantOverviewPage"));
const RestaurantFeedbackPage = lazy(() => import("@/pages/RestaurantFeedbackPage"));
const RestaurantQRCodePage = lazy(() => import("@/pages/RestaurantQRCodePage"));
const RestaurantAnalyticsPage = lazy(() => import("@/pages/RestaurantAnalyticsPage"));
const RestaurantSettingsPage = lazy(() => import("@/pages/RestaurantSettingsPage"));
const AccessibilityPage = lazy(() => import("@/pages/AccessibilityPage"));
const CampaignsPage = lazy(() => import("@/pages/CampaignsPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const GamificationPage = lazy(() => import("@/pages/GamificationPage"));
const AdvancedAnalyticsPage = lazy(() => import("@/pages/AdvancedAnalyticsPage"));
const CommunicationPage = lazy(() => import("@/pages/CommunicationPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AIInsightsPage = lazy(() => import("@/pages/AIInsightsPage"));
const GeneralAnalyticsPage = lazy(() => import("@/pages/GeneralAnalyticsPage"));
const NPSEnginePage = lazy(() => import("@/pages/NPSEnginePage"));
const IntegrationsPage = lazy(() => import("@/pages/IntegrationsPage")); // Nova importação

// Customer pages
const CustomerGamificationPage = lazy(() => import("@/pages/CustomerGamificationPage"));
const CustomerEventsPage = lazy(() => import("@/pages/CustomerEventsPage"));
const CustomerRewardsPage = lazy(() => import("@/pages/CustomerRewardsPage"));

export const protectedRoutes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // Renderiza Index (seletor de inquilino/localização) em "/"
        element: <Index />,
      },
      {
        path: "dashboard", // Renderiza Index (seletor de inquilino/localização) em "/dashboard"
        element: <Index />,
      },
      // Rotas específicas para visualizações relacionadas à localização
      { path: "overview", element: <RestaurantOverviewPage /> },
      { path: "feedback", element: <RestaurantFeedbackPage /> },
      { path: "qrcode", element: <RestaurantQRCodePage /> },
      { path: "location-analytics", element: <RestaurantAnalyticsPage /> }, // Alterado para location-analytics
      { path: "location-settings", element: <RestaurantSettingsPage /> }, // Alterado para location-settings

      // Rotas gerais do aplicativo
      { path: "advanced-analytics", element: <AdvancedAnalyticsPage /> },
      { path: "campaigns", element: <CampaignsPage /> },
      { path: "events", element: <EventsPage /> },
      { path: "gamification", element: <GamificationPage /> },
      { path: "communication", element: <CommunicationPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "accessibility", element: <AccessibilityPage /> },
      { path: "ai-insights", element: <AIInsightsPage /> },
      { path: "general-analytics", element: <GeneralAnalyticsPage /> },
      { path: "nps-engine", element: <NPSEnginePage /> },
      { path: "integrations", element: <IntegrationsPage /> }, // Nova rota

      // Customer routes
      { path: "customer/gamification", element: <CustomerGamificationPage /> },
      { path: "customer/events", element: <CustomerEventsPage /> },
      { path: "customer/rewards", element: <CustomerRewardsPage /> },
    ],
  },
  // Rotas de billing como rotas separadas e protegidas
  {
    path: "/billing",
    element: (
      <ProtectedRoute>
        <BillingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/billing/success",
    element: (
      <ProtectedRoute>
        <BillingSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/billing/cancel",
    element: (
      <ProtectedRoute>
        <BillingCancelPage />
      </ProtectedRoute>
    ),
  },
];