import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Tenant, Location, TenantContextType } from "@/types/tenant"; // Alterado para Location
import { useAuth } from "@/contexts/AuthContext"; // Importar useAuth
import { tenantService, locationService } from "@/lib/supabase-services"; // Importar serviços do Supabase
import { toast } from "sonner"; // Importar toast para notificações

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const { user, loading: authLoading } = useAuth(); // Obter usuário e estado de carregamento da autenticação
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null); // Alterado para currentLocation
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [locations, setLocations] = useState<Location[]>([]); // Alterado para locations
  const [loading, setLoading] = useState(true);

  const getLocationsByTenant = (tenantId: string): Location[] => { // Alterado para getLocationsByTenant
    return locations.filter(location => location.tenantId === tenantId);
  };

  // Carregar tenants e localizações do Supabase
  useEffect(() => {
    const fetchTenantData = async () => {
      if (authLoading) return; // Esperar a autenticação carregar

      setLoading(true);
      try {
        if (user) {
          // Para um usuário logado, buscar o tenant ao qual ele pertence
          const userTenant = await tenantService.getById(user.tenant.id);
          if (userTenant) {
            setTenants([userTenant]); // O usuário só vê seu próprio tenant
            setCurrentTenant(userTenant);

            // Buscar localizações para este tenant
            const tenantLocations = await locationService.getAll(userTenant.id);
            setLocations(tenantLocations);

            // Tentar carregar a localização salva no localStorage
            const savedLocationId = localStorage.getItem("currentLocationId");
            if (savedLocationId) {
              const location = tenantLocations.find(l => l.id === savedLocationId && l.tenantId === userTenant.id);
              if (location) {
                setCurrentLocation(location);
              }
            }
          } else {
            toast.error("Tenant do usuário não encontrado.");
            setCurrentTenant(null);
            setCurrentLocation(null);
          }
        } else {
          // Se não houver usuário logado, limpar estados
          setTenants([]);
          setLocations([]);
          setCurrentTenant(null);
          setCurrentLocation(null);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do tenant/localizações:", error);
        toast.error("Erro ao carregar dados da empresa ou localizações.");
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [user, authLoading]); // Depende do usuário e do estado de carregamento da autenticação

  // Salvar tenant no localStorage quando ele muda
  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem("currentTenantId", currentTenant.id);
    } else {
      localStorage.removeItem("currentTenantId");
    }
  }, [currentTenant]);

  // Salvar localização no localStorage quando ela muda
  useEffect(() => {
    if (currentLocation) {
      localStorage.setItem("currentLocationId", currentLocation.id);
    } else {
      localStorage.removeItem("currentLocationId");
    }
  }, [currentLocation]);

  const value: TenantContextType = {
    currentTenant,
    currentLocation,
    setCurrentTenant,
    setCurrentLocation,
    tenants,
    locations,
    getLocationsByTenant,
  };

  // Se ainda estiver carregando, pode retornar um spinner ou null
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <div className="ml-4 text-lg">Carregando dados da empresa...</div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};