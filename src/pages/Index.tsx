import { useTenant } from "@/contexts/TenantContext";
import TenantSelector from "@/components/tenant/TenantSelector";
import LocationSelector from "@/components/tenant/RestaurantSelector"; // Alterado para LocationSelector
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * IndexPage serve como o ponto de entrada principal após a autenticação.
 * Garante que um inquilino e uma localização sejam selecionados antes de renderizar o dashboard principal.
 * Se o usuário não estiver autenticado, redireciona para a página de login.
 */
const IndexPage = () => {
  const { user, loading } = useAuth();
  const { currentTenant, currentLocation } = useTenant(); // Alterado para currentLocation
  const location = useLocation();

  if (loading) {
    // Mostra um spinner de carregamento enquanto verifica o estado de autenticação
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
    // Se não autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, prossegue com a seleção de inquilino/localização
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

  if (!currentLocation) { // Alterado para currentLocation
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LocationSelector /> {/* Alterado para LocationSelector */}
      </motion.div>
    );
  }

  // Se o inquilino e a localização estiverem selecionados, e estivermos na raiz ou /dashboard,
  // redireciona para a página de visão geral padrão da localização.
  if (currentTenant && currentLocation && (location.pathname === '/' || location.pathname === '/dashboard')) { // Alterado para currentLocation
    return <Navigate to="/overview" replace />;
  }

  // Caso contrário, permite que o roteador renderize a página específica
  return null;
};

export default IndexPage;