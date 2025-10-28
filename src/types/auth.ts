import { UserRole } from './database'; // Assuming UserRole enum is defined in database.ts or will be created

export interface UserRegistration {
  email: string;
  password: string;
  full_name: string;
  tenant_name: string;
  subdomain: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface UserLogin {
  email: string;
  password: string;
}