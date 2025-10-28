import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { protectedRoutes } from "./protectedRoutes";
import { publicRoutes } from "./publicRoutes";
import { customerRoutes } from "./customerRoutes";

// Combine all routes
const allRoutes = [
  ...publicRoutes,
  ...protectedRoutes,
  ...customerRoutes,
];

export const router = createBrowserRouter(allRoutes);

// Export AppRoutes component for use in App.tsx
export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};