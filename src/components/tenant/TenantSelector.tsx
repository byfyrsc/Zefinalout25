import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/contexts/TenantContext";
import { Building2, Users, Crown } from "lucide-react";

const TenantSelector = () => {
  const { tenants, setCurrentTenant } = useTenant();

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Crown className="h-4 w-4 text-accent" />;
      case 'professional':
        return <Users className="h-4 w-4 text-primary" />;
      default:
        return <Building2 className="h-4 w-4 text-secondary" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30';
      case 'professional':
        return 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30';
      default:
        return 'bg-gradient-to-r from-secondary/20 to-secondary/10 border-secondary/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent mb-4">
            Plataforma SaaS - InteliFeed
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecione sua empresa para acessar o dashboard de restaurantes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card 
              key={tenant.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-strong hover:scale-105 ${getPlanColor(tenant.plan)}`}
              onClick={() => setCurrentTenant(tenant)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    {getPlanIcon(tenant.plan)}
                    {tenant.name}
                  </CardTitle>
                  <Badge variant={tenant.isActive ? "default" : "secondary"} className="text-xs">
                    {tenant.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{tenant.email}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {tenant.plan}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Desde {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Acessar Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block bg-gradient-to-r from-muted/50 to-background/50 border-dashed">
            <CardContent className="p-6">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">Precisa de uma nova conta?</p>
              <Button variant="outline" size="sm">
                Solicitar Acesso
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantSelector;