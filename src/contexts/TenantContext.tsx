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
  const { user, loading: authLoading, useMockAuth } = useAuth(); // Obter usuário, estado de carregamento da autenticação e useMockAuth
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null); // Alterado para currentLocation
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [locations, setLocations] = useState<Location[]>([]); // Alterado para locations
  const [loading, setLoading] = useState(true);

  const getLocationsByTenant = (tenantId: string): Location[] => { // Alterado para getLocationsByTenant
    return locations.filter(location => location.tenantId === tenantId);
  };

  // Carregar tenants e localizações do Supabase ou usar mocks
  useEffect(() => {
    const fetchTenantData = async () => {
      if (authLoading) return; // Esperar a autenticação carregar

      setLoading(true);
      try {
        if (useMockAuth && user) {
          // Usar dados mockados se a autenticação mockada estiver ativa
          const mockTenant: Tenant = {
            id: user.tenant.id,
            name: user.tenant.name,
            email: user.email,
            plan: user.tenant.plan_id as 'starter' | 'professional' | 'enterprise', // Assumindo que plan_id é compatível
            createdAt: user.tenant.created_at,
            isActive: true,
          };

          const mockLocations: Location[] = [
            {
              id: 'mock-location-1',
              tenantId: mockTenant.id,
              name: 'Mock Restaurant Downtown',
              address: '123 Mock Street, Mockville',
              phone: '555-1234',
              email: 'downtown@mockrestaurant.com',
              qrCode: 'https://mock-qr.com/downtown',
              isActive: true,
              settings: {
                theme: 'light',
                allowAnonymousFeedback: true,
                emailNotifications: true,
              },
              createdAt: new Date().toISOString(),
            },
            {
              id: 'mock-location-2',
              tenantId: mockTenant.id,
              name: 'Mock Restaurant Uptown',
              address: '456 Mock Avenue, Mockville',
              phone: '555-5678',
              email: 'uptown@mockrestaurant.com',
              qrCode: 'https://mock-qr.com/uptown',
              isActive: true,
              settings: {
                theme: 'dark',
                allowAnonymousFeedback: false,
                emailNotifications: true,
              },
              createdAt: new Date().toISOString(),
            },
          ];

          setTenants([mockTenant]);
          setCurrentTenant(mockTenant);
          setLocations(mockLocations);
          setCurrentLocation(mockLocations[0]); // Seleciona a primeira localização mockada por padrão

        } else if (user) {
          // Para um usuário logado (autenticação real), buscar o tenant ao qual ele pertence
          const userTenant = await tenantService.getById(user.tenant.id);
          if (userTenant) {
            // Mapear o tipo de Tenant do Supabase para o tipo Tenant do frontend
            const mappedTenant: Tenant = {
              id: userTenant.id,
              name: userTenant.name,
              email: user.email, // Usar email do usuário logado
              logo: userTenant.branding?.logo_url || undefined, // Assumindo branding tem logo_url
              plan: userTenant.plan_id as 'starter' | 'professional' | 'enterprise',
              createdAt: userTenant.created_at,
              isActive: true, // Assumindo que o tenant está ativo
            };

            setTenants([mappedTenant]); // O usuário só vê seu próprio tenant
            setCurrentTenant(mappedTenant);

            // Buscar localizações para este tenant
            const tenantLocations = await locationService.getAll(userTenant.id);
            // Mapear o tipo de Location do Supabase para o tipo Location do frontend
            const mappedLocations: Location[] = tenantLocations.map(loc => ({
              id: loc.id,
              tenantId: loc.tenant_id,
              name: loc.name,
              address: loc.address || '',
              phone: loc.phone || '',
              email: loc.email || '',
              logo: loc.settings?.logo_url || undefined, // Assumindo settings tem logo_url
              qrCode: `https://digaze.com/feedback/${loc.id}`, // Gerar URL de QR Code mockada
              isActive: loc.is_active,
              settings: {
                theme: (loc.settings?.theme as 'light' | 'dark') || 'light',
                allowAnonymousFeedback: loc.settings?.allow_anonymous_feedback || false,
                emailNotifications: loc.settings?.email_notifications || false,
              },
              createdAt: loc.created_at,
            }));
            setLocations(mappedLocations);

            // Tentar carregar a localização salva no localStorage
            const savedLocationId = localStorage.getItem("currentLocationId");
            if (savedLocationId) {
              const location = mappedLocations.find(l => l.id === savedLocationId && l.tenantId === mappedTenant.id);
              if (location) {
                setCurrentLocation(location);
              } else if (mappedLocations.length > 0) {
                setCurrentLocation(mappedLocations[0]); // Seleciona a primeira se a salva não for encontrada
              }
            } else if (mappedLocations.length > 0) {
              setCurrentLocation(mappedLocations[0]); // Seleciona a primeira se nenhuma for salva
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
  }, [user, authLoading, useMockAuth]); // Depende do usuário, do estado de carregamento da autenticação e de useMockAuth

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