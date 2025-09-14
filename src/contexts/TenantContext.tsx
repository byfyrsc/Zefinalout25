import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Tenant, Location, TenantContextType } from "@/types/tenant";
import { useAuth } from "@/contexts/AuthContext";
import { tenantService, locationService } from "@/lib/supabase-services";
import { toast } from "sonner";

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
  const { user, loading: authLoading, useMockAuth } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocationsByTenant = useCallback((tenantId: string): Location[] => {
    return locations.filter(location => location.tenantId === tenantId);
  }, [locations]);

  const refreshLocations = useCallback(async (tenantId: string) => {
    try {
      const tenantLocations = await locationService.getAllByTenant(tenantId);
      const mappedLocations: Location[] = tenantLocations.map(loc => ({
        id: loc.id,
        tenantId: loc.tenant_id,
        name: loc.name,
        address: loc.address || '',
        phone: loc.phone || '',
        email: loc.email || '',
        logo: loc.settings?.logo_url || undefined,
        qrCode: `https://digaze.com/feedback/${loc.id}`,
        isActive: loc.is_active,
        settings: {
          theme: (loc.settings?.theme as 'light' | 'dark') || 'light',
          allowAnonymousFeedback: loc.settings?.allow_anonymous_feedback || false,
          emailNotifications: loc.settings?.email_notifications || false,
        },
        createdAt: loc.created_at,
      }));
      setLocations(mappedLocations);
      return mappedLocations;
    } catch (error) {
      console.error("Erro ao recarregar localizações:", error);
      toast.error("Erro ao recarregar localizações.");
      return [];
    }
  }, []);

  // Carregar tenants e localizações
  useEffect(() => {
    const fetchTenantData = async () => {
      if (authLoading) return;

      setLoading(true);
      try {
        if (!user) {
          setTenants([]);
          setLocations([]);
          setCurrentTenant(null);
          setCurrentLocation(null);
          return;
        }

        // Always set currentTenant from user.tenant if available
        const userTenantData = user.tenant;
        const mappedTenant: Tenant = {
          id: userTenantData.id,
          name: userTenantData.name,
          email: user.email,
          logo: userTenantData.branding?.logo_url || undefined,
          plan: userTenantData.plan_id as 'starter' | 'professional' | 'enterprise' | 'enterprise_plus',
          createdAt: userTenantData.created_at,
          isActive: true,
        };
        setTenants([mappedTenant]);
        setCurrentTenant(mappedTenant);

        let fetchedLocations: Location[] = [];
        if (useMockAuth) {
          // Generate mock locations for the mock tenant
          fetchedLocations = [
            {
              id: 'mock-location-1',
              tenantId: mappedTenant.id,
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
              tenantId: mappedTenant.id,
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
          setLocations(fetchedLocations);
        } else {
          // Fetch real locations for the real tenant
          fetchedLocations = await refreshLocations(mappedTenant.id);
        }

        // Set currentLocation: try saved, then first available
        const savedLocationId = localStorage.getItem("currentLocationId");
        const foundSavedLocation = fetchedLocations.find(l => l.id === savedLocationId && l.tenantId === mappedTenant.id);
        
        if (foundSavedLocation) {
          setCurrentLocation(foundSavedLocation);
        } else if (fetchedLocations.length > 0) {
          setCurrentLocation(fetchedLocations[0]);
        } else {
          setCurrentLocation(null); // No locations available
        }

      } catch (error) {
        console.error("Erro ao carregar dados do tenant/localizações:", error);
        toast.error("Erro ao carregar dados da empresa ou localizações.");
        setTenants([]);
        setLocations([]);
        setCurrentTenant(null);
        setCurrentLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [user, authLoading, useMockAuth, refreshLocations]);

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