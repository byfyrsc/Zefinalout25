import { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requiredRole,
  requiredPermission,
  fallbackPath = '/login',
  showUnauthorized = true
}: ProtectedRouteProps) => {
  const { user, loading, hasRole, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State to track authentication timeout
  const [authTimeout, setAuthTimeout] = useState(false);
  
  // Set a timeout to avoid getting stuck in loading state
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        setAuthTimeout(true);
        toast.error('Tempo limite de autenticação excedido. Por favor, tente novamente.');
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  // Show loading spinner while checking authentication
  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-muted-foreground text-center">
              Verificando autenticação...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If authentication check times out, redirect to login
  if (authTimeout) {
    return <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />;
  }

  // Check if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role requirement
  if (requiredRole && user && !hasRole(requiredRole)) {
    if (!showUnauthorized) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-6">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta página.
                <br />
                Role necessária: <span className="font-medium">{requiredRole}</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && user && !hasPermission(requiredPermission)) {
    if (!showUnauthorized) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-6">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Permissão Insuficiente</h2>
              <p className="text-muted-foreground">
                Você não tem a permissão necessária para acessar esta funcionalidade.
                <br />
                Permissão necessária: <span className="font-medium">{requiredPermission}</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="admin">
    {children}
  </ProtectedRoute>
);

export const ManagerRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="manager">
    {children}
  </ProtectedRoute>
);

export const OwnerRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="owner">
    {children}
  </ProtectedRoute>
);

// Permission-based route protection
export const PermissionRoute = ({ 
  children, 
  permission 
}: { 
  children: ReactNode;
  permission: string;
}) => (
  <ProtectedRoute requiredPermission={permission}>
    {children}
  </ProtectedRoute>
);