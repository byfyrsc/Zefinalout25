import { useTenant } from "@/contexts/TenantContext";
import TenantSelector from "@/components/tenant/TenantSelector";
import RestaurantSelector from "@/components/tenant/RestaurantSelector";
import RestaurantDashboard from "@/components/restaurant/RestaurantDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * IndexPage serves as the main entry point after authentication.
 * It ensures that a tenant and a restaurant are selected before rendering the main dashboard.
 * If the user is not authenticated, it redirects to the login page.
 */
const IndexPage = () => {
  const { user, loading } = useAuth();
  const { currentTenant, currentRestaurant } = useTenant();

  if (loading) {
    // Show a loading spinner while checking auth state
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="ml-4 text-lg">Carregando...</div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, proceed with tenant/restaurant selection
  if (!currentTenant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TenantSelector />
      </motion.div>
    );
  }

  if (!currentRestaurant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <RestaurantSelector />
      </motion.div>
    );
  }

  // Once tenant and restaurant are selected, show the main dashboard
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <RestaurantDashboard />
    </motion.div>
  );
};

export default IndexPage;