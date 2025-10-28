import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Campaign } from "@/types/campaigns";
import { BarChart3, Eye, MousePointer, Mail, MessageSquare, TrendingUp, Plus, Filter } from "lucide-react";

export default function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Load campaigns from localStorage (mock data)
    const savedCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    
    // Add some mock campaigns if none exist
    if (savedCampaigns.length === 0) {
      const mockCampaigns: Campaign[] = [
        {
          id: 'campaign-1',
          tenantId: 'tenant-1',
          restaurantId: 'rest-1',
          name: 'Promoção de Verão',
          description: 'Oferta especial para drinks no verão',
          type: 'email',
          status: 'active',
          targetAudience: { segment: 'all' },
          content: {
            subject: '🏖️ Drinks com 30% OFF!',
            message: 'Aproveite o verão com nossos drinks refrescantes',
            ctaText: 'Ver Promoção'
          },
          metrics: {
            sent: 1250,
            delivered: 1200,
            opened: 480,
            clicked: 96,
            converted: 24
          },
          createdAt: '2024-03-10T10:00:00Z',
          createdBy: 'user-1'
        },
        {
          id: 'campaign-2',
          tenantId: 'tenant-1',
          name: 'Feedback Survey',
          description: 'Pesquisa de satisfação mensal',
          type: 'push',
          status: 'completed',
          targetAudience: { segment: 'high-value' },
          content: {
            message: 'Como foi sua experiência conosco?',
            ctaText: 'Avaliar'
          },
          metrics: {
            sent: 500,
            delivered: 495,
            opened: 198,
            clicked: 89,
            converted: 67
          },
          createdAt: '2024-03-01T08:00:00Z',
          createdBy: 'user-1'
        }
      ];
      
      localStorage.setItem('campaigns', JSON.stringify(mockCampaigns));
      setCampaigns(mockCampaigns);
    } else {
      setCampaigns(savedCampaigns);
    }
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => 
    statusFilter === "all" || campaign.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'draft': return 'bg-secondary text-secondary-foreground';
      case 'scheduled': return 'bg-warning text-warning-foreground';
      case 'paused': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'push': return '🔔';
      case 'in-app': return '📲';
      case 'social': return '🌟';
      default: return '📬';
    }
  };

  const calculateEngagementRate = (metrics: Campaign['metrics']) => {
    return metrics.sent > 0 ? (metrics.opened / metrics.sent * 100).toFixed(1) : '0';
  };

  const calculateConversionRate = (metrics: Campaign['metrics']) => {
    return metrics.clicked > 0 ? (metrics.converted / metrics.clicked * 100).toFixed(1) : '0';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas de marketing</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
              <SelectItem value="draft">Rascunhos</SelectItem>
              <SelectItem value="scheduled">Agendadas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-primary to-primary-glow">
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Enviado</p>
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.reduce((sum, c) => sum + c.metrics.sent, 0).toLocaleString()}
                </p>
              </div>
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Abertura</p>
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.length > 0 ? (
                    campaigns.reduce((sum, c) => sum + c.metrics.opened, 0) / 
                    campaigns.reduce((sum, c) => sum + c.metrics.sent, 0) * 100
                  ).toFixed(1) : '0'}%
                </p>
              </div>
              <Eye className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Clique</p>
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.length > 0 ? (
                    campaigns.reduce((sum, c) => sum + c.metrics.clicked, 0) / 
                    campaigns.reduce((sum, c) => sum + c.metrics.opened, 0) * 100
                  ).toFixed(1) : '0'}%
                </p>
              </div>
              <MousePointer className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversões</p>
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.reduce((sum, c) => sum + c.metrics.converted, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-medium transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Entregues</span>
                    <span className="font-medium">{campaign.metrics.delivered}/{campaign.metrics.sent}</span>
                  </div>
                  <Progress 
                    value={(campaign.metrics.delivered / campaign.metrics.sent) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Abertura</span>
                    <span className="font-medium">{calculateEngagementRate(campaign.metrics)}%</span>
                  </div>
                  <Progress 
                    value={Number(calculateEngagementRate(campaign.metrics))} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cliques</span>
                    <span className="font-medium">{campaign.metrics.clicked}</span>
                  </div>
                  <Progress 
                    value={(campaign.metrics.clicked / campaign.metrics.opened) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Conversão</span>
                    <span className="font-medium">{calculateConversionRate(campaign.metrics)}%</span>
                  </div>
                  <Progress 
                    value={Number(calculateConversionRate(campaign.metrics))} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card className="p-12 text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma campanha encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter === "all" 
              ? "Crie sua primeira campanha para começar a engajar seus clientes"
              : `Não há campanhas com status "${statusFilter}"`
            }
          </p>
          <Button>Criar Nova Campanha</Button>
        </Card>
      )}
    </div>
  );
}