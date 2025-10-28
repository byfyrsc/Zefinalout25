import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/contexts/TenantContext";
import { MapPin, Phone, Mail, QrCode, ArrowLeft, Plus } from "lucide-react";

const LocationSelector = () => { // Renomeado para LocationSelector
  const { 
    currentTenant, 
    setCurrentTenant, 
    setCurrentLocation, // Alterado para setCurrentLocation
    getLocationsByTenant // Alterado para getLocationsByTenant
  } = useTenant();

  if (!currentTenant) return null;

  const locations = getLocationsByTenant(currentTenant.id); // Alterado para locations

  const handleBackToTenants = () => {
    setCurrentTenant(null);
    setCurrentLocation(null); // Limpar localização ao voltar para tenants
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToTenants}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {currentTenant.name}
              </h1>
              <p className="text-muted-foreground">
                Selecione uma localização para gerenciar
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="capitalize text-sm px-3 py-1"
          >
            Plano {currentTenant.plan}
          </Badge>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {locations.map((location) => ( // Alterado para locations
            <Card 
              key={location.id} 
              className="cursor-pointer transition-all duration-300 bg-card border-2 border-transparent hover:border-primary"
              onClick={() => setCurrentLocation(location)} // Alterado para setCurrentLocation
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {location.name}
                  </CardTitle>
                  <Badge variant={location.isActive ? "default" : "secondary"} className="text-xs">
                    {location.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">
                      {location.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{location.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{location.email}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">QR Code de Feedback</span>
                  </div>
                  <Button className="w-full" size="sm">
                    Acessar Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Location Card */}
        <Card className="border-dashed border-2 border-muted-foreground/20 bg-card">
          <CardContent className="p-8 text-center">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Adicionar Nova Localização</h3>
            <p className="text-muted-foreground mb-4">
              Expanda sua rede de localizações e colete mais feedback
            </p>
            <Button variant="outline">
              Adicionar Localização
            </Button>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-l-4 border-primary">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{locations.length}</div>
              <div className="text-sm text-muted-foreground">Localizações Ativas</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-l-4 border-secondary">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">
                {locations.filter(l => l.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Em Operação</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-l-4 border-accent">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {new Date(currentTenant.createdAt).getFullYear()}
              </div>
              <div className="text-sm text-muted-foreground">Cliente Desde</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector; // Exportar como LocationSelector