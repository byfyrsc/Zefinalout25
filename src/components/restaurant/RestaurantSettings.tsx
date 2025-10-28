import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Location } from "@/types/tenant"; // Alterado para Location
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Palette,
  Bell,
  Shield,
  Info
} from "lucide-react";

interface LocationSettingsProps { // Alterado para LocationSettingsProps
  location: Location; // Alterado para location
}

const LocationSettings = ({ location }: LocationSettingsProps) => { // Alterado para location
  const [formData, setFormData] = useState({
    name: location.name,
    address: location.address,
    phone: location.phone,
    email: location.email,
    theme: location.settings.theme,
    allowAnonymousFeedback: location.settings.allowAnonymousFeedback,
    emailNotifications: location.settings.emailNotifications,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: "As configurações da localização foram atualizadas com sucesso.",
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="bg-gradient-to-br from-card to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Localização</Label> {/* Alterado para Localização */}
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome da localização"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Endereço completo"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@localizacao.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance & Experience */}
        <Card className="bg-gradient-to-br from-card to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência & Experiência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema da Interface</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value) => handleInputChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define a aparência do formulário de feedback para os clientes
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Feedback Anônimo
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Permitir que clientes enviem feedback sem se identificar
                  </p>
                </div>
                <Switch
                  checked={formData.allowAnonymousFeedback}
                  onCheckedChange={(value) => handleInputChange('allowAnonymousFeedback', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notificações por Email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receber notificações quando novos feedbacks chegarem
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(value) => handleInputChange('emailNotifications', value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Information */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações do QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>URL Atual do Feedback</Label>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <code className="text-sm">{location.qrCode}</code>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>ID da Localização</Label> {/* Alterado para Localização */}
              <div className="p-3 bg-muted/50 rounded-lg border">
                <code className="text-sm">{location.id}</code>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <h4 className="font-medium text-accent-foreground mb-2">
              Sobre o QR Code
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• O QR Code é gerado automaticamente baseado no ID da localização</li>
              <li>• Clientes escaneiam o código e são direcionados para o formulário</li>
              <li>• As configurações acima afetam a experiência do cliente</li>
              <li>• Você pode regenerar o QR Code a qualquer momento na aba "QR Code"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};

export default LocationSettings; // Exportar como LocationSettings