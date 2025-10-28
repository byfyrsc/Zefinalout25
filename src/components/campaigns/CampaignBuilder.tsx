import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Send, Users, Target, BarChart3, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Campaign } from "@/types/campaigns";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";

export default function CampaignBuilder() {
  const [campaign, setCampaign] = useState<Partial<Campaign>>({
    name: "",
    description: "",
    type: "email",
    targetAudience: { segment: "all" },
    content: { message: "" },
    status: "draft"
  });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { currentTenant, currentRestaurant } = useTenant();
  const { toast } = useToast();

  const handleSave = () => {
    if (!campaign.name || !campaign.content?.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o nome e mensagem da campanha",
        variant: "destructive"
      });
      return;
    }

    // Mock save - in real app would call API
    const savedCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    const newCampaign: Campaign = {
      ...campaign as Campaign,
      id: `campaign-${Date.now()}`,
      tenantId: currentTenant?.id || '',
      restaurantId: currentRestaurant?.id,
      schedule: startDate ? {
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString()
      } : undefined,
      metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 },
      createdAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    savedCampaigns.push(newCampaign);
    localStorage.setItem('campaigns', JSON.stringify(savedCampaigns));

    toast({
      title: "Campanha salva!",
      description: "Sua campanha foi criada com sucesso",
    });

    // Reset form
    setCampaign({
      name: "",
      description: "",
      type: "email",
      targetAudience: { segment: "all" },
      content: { message: "" },
      status: "draft"
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleLaunch = () => {
    handleSave();
    toast({
      title: "🚀 Campanha lançada!",
      description: "Sua campanha está agora ativa",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaign Builder</h1>
          <p className="text-muted-foreground">Crie campanhas de marketing personalizadas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>Salvar Rascunho</Button>
          <Button onClick={handleLaunch} className="bg-gradient-to-r from-primary to-primary-glow">
            <Send className="w-4 h-4 mr-2" />
            Lançar Campanha
          </Button>
        </div>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="audience">Audiência</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="schedule">Agendamento</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Configuração da Campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Campanha</Label>
                  <Input
                    id="name"
                    value={campaign.name}
                    onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Promoção de Verão"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Campanha</Label>
                  <Select value={campaign.type} onValueChange={(value) => setCampaign(prev => ({ ...prev, type: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">📧 Email Marketing</SelectItem>
                      <SelectItem value="sms">📱 SMS</SelectItem>
                      <SelectItem value="push">🔔 Push Notification</SelectItem>
                      <SelectItem value="in-app">📲 In-App Message</SelectItem>
                      <SelectItem value="social">🌟 Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={campaign.description}
                  onChange={(e) => setCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo da sua campanha..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Segmentação de Audiência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Segmento de Clientes</Label>
                <Select 
                  value={campaign.targetAudience?.segment} 
                  onValueChange={(value) => setCampaign(prev => ({ 
                    ...prev, 
                    targetAudience: { ...prev.targetAudience, segment: value as any }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌎 Todos os clientes</SelectItem>
                    <SelectItem value="high-value">⭐ Clientes VIP</SelectItem>
                    <SelectItem value="inactive">😴 Clientes inativos</SelectItem>
                    <SelectItem value="new">🆕 Novos clientes</SelectItem>
                    <SelectItem value="custom">🎯 Segmento personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {campaign.targetAudience?.segment === 'custom' && (
                <Card className="p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Filtros Personalizados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Rating Mínimo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">⭐ 1+</SelectItem>
                          <SelectItem value="2">⭐⭐ 2+</SelectItem>
                          <SelectItem value="3">⭐⭐⭐ 3+</SelectItem>
                          <SelectItem value="4">⭐⭐⭐⭐ 4+</SelectItem>
                          <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Última visita</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Qualquer período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Últimos 7 dias</SelectItem>
                          <SelectItem value="30">Últimos 30 dias</SelectItem>
                          <SelectItem value="90">Últimos 3 meses</SelectItem>
                          <SelectItem value="365">Último ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Min. Feedbacks</Label>
                      <Input type="number" placeholder="0" min="0" />
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Audiência Estimada</p>
                  <p className="text-sm text-muted-foreground">~2,500 clientes serão alcançados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo da Campanha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.type === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto do Email</Label>
                  <Input
                    id="subject"
                    value={campaign.content?.subject || ''}
                    onChange={(e) => setCampaign(prev => ({ 
                      ...prev, 
                      content: { ...prev.content, subject: e.target.value }
                    }))}
                    placeholder="🍕 Oferta especial só para você!"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={campaign.content?.message || ''}
                  onChange={(e) => setCampaign(prev => ({ 
                    ...prev, 
                    content: { ...prev.content, message: e.target.value }
                  }))}
                  placeholder="Escreva sua mensagem aqui..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta">Texto do Botão</Label>
                  <Input
                    id="cta"
                    value={campaign.content?.ctaText || ''}
                    onChange={(e) => setCampaign(prev => ({ 
                      ...prev, 
                      content: { ...prev.content, ctaText: e.target.value }
                    }))}
                    placeholder="Aproveite Agora"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaUrl">Link do Botão</Label>
                  <Input
                    id="ctaUrl"
                    value={campaign.content?.ctaUrl || ''}
                    onChange={(e) => setCampaign(prev => ({ 
                      ...prev, 
                      content: { ...prev.content, ctaUrl: e.target.value }
                    }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="schedule" />
                <Label htmlFor="schedule">Agendar campanha</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data de Fim (opcional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Uma vez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Uma vez</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}