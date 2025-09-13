import { useRoutes } from "react-router-dom";

import { publicRoutes } from "./publicRoutes";
import { protectedRoutes } from "./protectedRoutes";

export function AppRoutes() {
  const routes = useRoutes([...publicRoutes, ...protectedRoutes]);

  return routes;
}
