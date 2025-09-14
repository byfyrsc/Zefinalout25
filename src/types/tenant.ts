export interface Tenant {
  id: string;
  name: string;
  email: string;
  logo?: string;
  plan: 'starter' | 'professional' | 'enterprise' | 'enterprise_plus'; // Adicionado 'enterprise_plus'
  createdAt: string;
  isActive: boolean;
}

// Renomeado de Restaurant para Location para refletir o esquema do Supabase
export interface Location {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  qrCode: string;
  isActive: boolean;
  settings: {
    theme: 'light' | 'dark';
    allowAnonymousFeedback: boolean;
    emailNotifications: boolean;
  };
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  locationIds: string[]; // Localizações que o usuário pode acessar
  isActive: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  locationId: string; // Alterado de restaurantId para locationId
  customerName?: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  category: 'food' | 'service' | 'ambiance' | 'price' | 'overall';
  isAnonymous: boolean;
  createdAt: string;
}

export interface TenantContextType {
  currentTenant: Tenant | null;
  currentLocation: Location | null; // Alterado de currentRestaurant para currentLocation
  setCurrentTenant: (tenant: Tenant | null) => void;
  setCurrentLocation: (location: Location | null) => void; // Alterado de setCurrentRestaurant
  tenants: Tenant[];
  locations: Location[]; // Alterado de restaurants para locations
  getLocationsByTenant: (tenantId: string) => Location[]; // Alterado de getRestaurantsByTenant
}