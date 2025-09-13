import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { motion } from 'framer-motion';

interface AppProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const AppProviders = ({ 
  children, 
  queryClient = new QueryClient() 
}: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <TooltipProvider>
          <AuthProvider>
            <TenantProvider>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
              <Toaster />
              <Sonner />
            </TenantProvider>
          </AuthProvider>
        </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
};