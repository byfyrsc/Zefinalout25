import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event, EventParticipant } from "@/types/campaigns";
import { Calendar, Trophy, Users, Zap, Gift, Star, Plus, Timer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventsHub() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    // Load events from localStorage or create mock data
    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]');
    
    if (savedEvents.length === 0) {
      const mockEvents: Event[] = [
        {
          id: 'event-1',
          tenantId: 'tenant-1',
          restaurantIds: ['rest-1', 'rest-2'],
          name: 'Happy Hour Challenge',
          description: 'Competição entre unidades para o melhor happy hour',
          type: 'contest',
          status: 'active',
          startDate: '2024-03-20T17:00:00Z',
          endDate: '2024-03-22T22:00:00Z',
          rules: {
            participationRequirement: 'feedback',
            minRating: 4,
            requiresRegistration: false
          },
          rewards: {
            type: 'discount',
            value: '20%',
            description: '20% de desconto na próxima visita'
          },
          gamification: {
            pointsAwarded: 50,
            badgeEarned: 'Happy Hour Hero',
            leaderboardCategory: 'points'
          },
          participants: [],
          metrics: {
            totalParticipants: 87,
            feedbackGenerated: 87,
            conversionRate: 23.5,
            engagementScore: 8.7
          },
          createdAt: '2024-03-15T10:00:00Z'
        },
        {
          id: 'event-2',
          tenantId: 'tenant-1',
          restaurantIds: ['rest-1'],
          name: 'Weekend Feedback Frenzy',
          description: 'Ganhe pontos duplos por feedback no fim de semana',
          type: 'feedback-drive',
          status: 'upcoming',
          startDate: '2024-03-25T00:00:00Z',
          endDate: '2024-03-26T23:59:59Z',
          rules: {
            participationRequirement: 'any',
            requiresRegistration: false
          },
          rewards: {
            type: 'points',
            value: 'Dobro',
            description: 'Pontos duplos por cada feedback'
          },
          gamification: {
            pointsAwarded: 100,
            badgeEarned: 'Weekend Warrior'
          },
          participants: [],
          metrics: {
            totalParticipants: 0,
            feedbackGenerated: 0,
            conversionRate: 0,
            engagementScore: 0
          },
          createdAt: '2024-03-18T14:00:00Z'
        },
        {
          id: 'event-3',
          tenantId: 'tenant-1',
          restaurantIds: ['rest-2', 'rest-3'],
          name: 'Pizza Battle Royale',
          description: 'Vote na melhor pizza das nossas unidades',
          type: 'promotion',
          status: 'ended',
          startDate: '2024-03-01T00:00:00Z',
          endDate: '2024-03-15T23:59:59Z',
          rules: {
            participationRequirement: 'rating-threshold',
            minRating: 3,
            maxParticipants: 200,
            requiresRegistration: true
          },
          rewards: {
            type: 'freebie',
            value: 'Pizza grátis',
            description: 'Pizza individual grátis para o vencedor'
          },
          gamification: {
            pointsAwarded: 75,
            badgeEarned: 'Pizza Critic',
            leaderboardCategory: 'ratings'
          },
          participants: [],
          metrics: {
            totalParticipants: 156,
            feedbackGenerated: 156,
            conversionRate: 34.2,
            engagementScore: 9.1
          },
          createdAt: '2024-02-25T09:00:00Z'
        }
      ];
      
      localStorage.setItem('events', JSON.stringify(mockEvents));
      setEvents(mockEvents);
    } else {
      setEvents(savedEvents);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'upcoming': return 'bg-warning text-warning-foreground';
      case 'ended': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contest': return <Trophy className="w-5 h-5" />;
      case 'promotion': return <Gift className="w-5 h-5" />;
      case 'survey': return <Star className="w-5 h-5" />;
      case 'feedback-drive': return <Zap className="w-5 h-5" />;
      case 'loyalty': return <Users className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contest': return 'Competição';
      case 'promotion': return 'Promoção';
      case 'survey': return 'Pesquisa';
      case 'feedback-drive': return 'Drive de Feedback';
      case 'loyalty': return 'Fidelidade';
      default: return type;
    }
  };

  const filteredEvents = events.filter(event => {
    switch (activeTab) {
      case 'active': return event.status === 'active';
      case 'upcoming': return event.status === 'upcoming';
      case 'ended': return event.status === 'ended';
      case 'all': return true;
      default: return true;
    }
  });

  const calculateProgress = (event: Event) => {
    const now = new Date().getTime();
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate).getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return ((now - start) / (end - start)) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos Interativos</h1>
          <p className="text-muted-foreground">Crie experiências gamificadas para seus clientes</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow">
          <Plus className="w-4 h-4 mr-2" />
          Criar Evento
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Ativos</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.filter(e => e.status === 'active').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participantes</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.reduce((sum, e) => sum + e.metrics.totalParticipants, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Feedback Gerado</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.reduce((sum, e) => sum + e.metrics.feedbackGenerated, 0)}
                </p>
              </div>
              <Star className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engajamento Médio</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.length > 0 ? (
                    events.reduce((sum, e) => sum + e.metrics.engagementScore, 0) / events.length
                  ).toFixed(1) : '0'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Ativos ({events.filter(e => e.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos ({events.filter(e => e.status === 'upcoming').length})</TabsTrigger>
          <TabsTrigger value="ended">Finalizados ({events.filter(e => e.status === 'ended').length})</TabsTrigger>
          <TabsTrigger value="all">Todos ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-medium transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(event.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.startDate), "dd 'de' MMM", { locale: ptBR })} - {format(new Date(event.endDate), "dd 'de' MMM", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.metrics.totalParticipants} participantes
                        </span>
                        {event.status === 'active' && (
                          <span className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            {Math.round(calculateProgress(event))}% concluído
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Ver Detalhes</Button>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">PROGRESSO</h4>
                    {event.status === 'active' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Tempo decorrido</span>
                          <span className="font-medium">{Math.round(calculateProgress(event))}%</span>
                        </div>
                        <Progress value={calculateProgress(event)} className="h-2" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Participantes</span>
                        <span className="font-medium">{event.metrics.totalParticipants}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Feedback gerado</span>
                        <span className="font-medium">{event.metrics.feedbackGenerated}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">RECOMPENSAS</h4>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.rewards.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Tipo: {event.rewards.type} • Valor: {event.rewards.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pontos: {event.gamification.pointsAwarded}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">PERFORMANCE</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Taxa de conversão</span>
                        <span className="font-medium">{event.metrics.conversionRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Score de engajamento</span>
                        <span className="font-medium">{event.metrics.engagementScore}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {filteredEvents.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Crie eventos interativos para engajar seus clientes e gerar mais feedback
          </p>
          <Button>Criar Primeiro Evento</Button>
        </Card>
      )}
    </div>
  );
}