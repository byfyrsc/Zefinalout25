import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Tenant, Restaurant, TenantContextType } from "@/types/tenant";
import { mockTenants, mockRestaurants } from "@/data/mockData";

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
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [tenants] = useState<Tenant[]>(mockTenants);
  const [restaurants] = useState<Restaurant[]>(mockRestaurants);

  const getRestaurantsByTenant = (tenantId: string): Restaurant[] => {
    return restaurants.filter(restaurant => restaurant.tenantId === tenantId);
  };

  // Load tenant from localStorage on mount
  useEffect(() => {
    const savedTenantId = localStorage.getItem("currentTenantId");
    const savedRestaurantId = localStorage.getItem("currentRestaurantId");
    
    // Check if we're in development mode with mock auth
    const isDevelopment = import.meta.env.DEV;
    const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
    
    if (isDevelopment && useMockAuth) {
      // Set default mock tenant and restaurant
      const defaultTenant = mockTenants[0]; // RestaurantGroup Brasil
      const defaultRestaurant = mockRestaurants[0]; // Sabor & Arte
      
      setCurrentTenant(defaultTenant);
      setCurrentRestaurant(defaultRestaurant);
      return;
    }
    
    if (savedTenantId) {
      const tenant = tenants.find(t => t.id === savedTenantId);
      if (tenant) {
        setCurrentTenant(tenant);
        
        if (savedRestaurantId) {
          const restaurant = restaurants.find(r => r.id === savedRestaurantId && r.tenantId === savedTenantId);
          if (restaurant) {
            setCurrentRestaurant(restaurant);
          }
        }
      }
    }
  }, [tenants, restaurants]);

  // Save tenant to localStorage when it changes
  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem("currentTenantId", currentTenant.id);
    } else {
      localStorage.removeItem("currentTenantId");
    }
  }, [currentTenant]);

  // Save restaurant to localStorage when it changes
  useEffect(() => {
    if (currentRestaurant) {
      localStorage.setItem("currentRestaurantId", currentRestaurant.id);
    } else {
      localStorage.removeItem("currentRestaurantId");
    }
  }, [currentRestaurant]);

  const value: TenantContextType = {
    currentTenant,
    currentRestaurant,
    setCurrentTenant,
    setCurrentRestaurant,
    tenants,
    restaurants,
    getRestaurantsByTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};