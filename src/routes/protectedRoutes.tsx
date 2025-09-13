import { lazy } from "react";

import { ProtectedRoute } from "@/routes/components/Protected";
import { DashboardLayout } from "@/pages/DashboardLayout";

const Index = lazy(() => import("@/pages/Index"));
const BillingPage = lazy(() =>
  import("@/pages/Billing").then((module) => ({ default: module.Billing }))
);
const BillingSuccessPage = lazy(() =>
  import("@/pages/Billing").then((module) => ({
    default: module.BillingSuccess,
  }))
);
const BillingCancelPage = lazy(() =>
  import("@/pages/Billing").then((module) => ({
    default: module.BillingCancel,
  }))
);

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
        index: true,
        element: <Index />,
      },
      {
        path: "dashboard",
        element: <Index />,
      },
      {
        path: "billing",
        element: <BillingPage />,
      },
      {
        path: "billing/success",
        element: <BillingSuccessPage />,
      },
      {
        path: "billing/cancel",
        element: <BillingCancelPage />,
      },
    ],
  },
];