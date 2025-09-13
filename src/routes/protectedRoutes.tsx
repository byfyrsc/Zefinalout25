import { lazy } from "react";

import { ProtectedRoute } from "@/routes/components/Protected";
import { DashboardLayout } from "@/pages/DashboardLayout";

const Index = lazy(() => import("@/pages/Index")); // Este é o seletor de inquilino/restaurante

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
const AIInsightsPage = lazy(() => import("@/pages/AIInsightsPage")); // Nova importação


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
        index: true, // Renderiza Index (seletor de inquilino/restaurante) em "/"
        element: <Index />,
      },
      {
        path: "dashboard", // Renderiza Index (seletor de inquilino/restaurante) em "/dashboard"
        element: <Index />,
      },
      // Rotas específicas para visualizações relacionadas ao restaurante
      { path: "overview", element: <RestaurantOverviewPage /> }, // Nova rota para a visão geral do dashboard refatorada
      { path: "feedback", element: <RestaurantFeedbackPage /> },
      { path: "qrcode", element: <RestaurantQRCodePage /> },
      { path: "restaurant-analytics", element: <RestaurantAnalyticsPage /> },
      { path: "restaurant-settings", element: <RestaurantSettingsPage /> },

      // Rotas gerais do aplicativo
      { path: "advanced-analytics", element: <AdvancedAnalyticsPage /> },
      { path: "campaigns", element: <CampaignsPage /> },
      { path: "events", element: <EventsPage /> },
      { path: "gamification", element: <GamificationPage /> },
      { path: "communication", element: <CommunicationPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "billing", element: <BillingPage /> },
      { path: "billing/success", element: <BillingSuccessPage /> },
      { path: "billing/cancel", element: <BillingCancelPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "accessibility", element: <AccessibilityPage /> },
      { path: "ai-insights", element: <AIInsightsPage /> }, // Nova rota
    ],
  },
];