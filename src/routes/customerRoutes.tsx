import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/components/Protected";
import CustomerLayout from "@/components/layout/CustomerLayout";

// Customer pages
const CustomerGamificationPage = lazy(() => import("@/pages/CustomerGamificationPage"));
const CustomerEventsPage = lazy(() => import("@/pages/CustomerEventsPage"));
const CustomerRewardsPage = lazy(() => import("@/pages/CustomerRewardsPage"));

export const customerRoutes = [
  {
    path: "/customer",
    element: (
      <ProtectedRoute>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="gamification" replace />,
      },
      { path: "gamification", element: <CustomerGamificationPage /> },
      { path: "events", element: <CustomerEventsPage /> },
      { path: "rewards", element: <CustomerRewardsPage /> },
    ],
  },
];