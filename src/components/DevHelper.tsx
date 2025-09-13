import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Code, User, Building, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const DevHelper = () => {
  const [useMockAuth, setUseMockAuth] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    const savedUseMockAuth = localStorage.getItem('useMockAuth') === 'true';
    setUseMockAuth(savedUseMockAuth);
  }, []);

  const toggleMockAuth = (enabled: boolean) => {
    setUseMockAuth(enabled);
    localStorage.setItem('useMockAuth', enabled.toString());
    
    if (enabled) {
      toast.success('Modo de desenvolvimento ativado', {
        description: 'Usando dados mock para autenticação. Recarregue a página.',
      });
    } else {
      toast.info('Modo de desenvolvimento desativado', {
        description: 'Voltando para autenticação real. Recarregue a página.',
      });
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  if (!isDevelopment) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Code className="h-4 w-4" />
            Development Helper
            <Badge variant="secondary" className="text-xs">DEV</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="mock-auth" className="text-sm font-medium">
                Usar dados mock
              </Label>
              <p className="text-xs text-muted-foreground">
                Pular autenticação real
              </p>
            </div>
            <Switch
              id="mock-auth"
              checked={useMockAuth}
              onCheckedChange={toggleMockAuth}
            />
          </div>
          
          {useMockAuth && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3" />
                  <span className="font-medium">Carlos Silva (Admin)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>RestaurantGroup Brasil</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Recarregue a página para aplicar</span>
                </div>
              </div>
            </>
          )}
          
          <Button 
            onClick={reloadPage} 
            size="sm" 
            className="w-full"
            variant={useMockAuth ? "default" : "outline"}
          >
            Recarregar Página
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};