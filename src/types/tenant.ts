export interface Tenant {
  id: string;
  name: string;
  email: string;
  logo?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  createdAt: string;
  isActive: boolean;
}

export interface Restaurant {
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
  restaurantIds: string[]; // Restaurantes que o usuário pode acessar
  isActive: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  restaurantId: string;
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
  currentRestaurant: Restaurant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  tenants: Tenant[];
  restaurants: Restaurant[];
  getRestaurantsByTenant: (tenantId: string) => Restaurant[];
}