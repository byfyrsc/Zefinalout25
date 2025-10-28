import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Phone, Mail, MessageCircle, Video, Users, Send, Bot, Headphones, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'chat' | 'phone' | 'video';
  status: 'active' | 'inactive' | 'pending';
  metrics: {
    sent: number;
    delivered: number;
    responses: number;
    satisfaction: number;
  };
}

interface SupportTicket {
  id: string;
  customer: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: string;
  created: string;
  lastUpdate: string;
}

export default function AdvancedCommunication() {
  const [channels] = useState<CommunicationChannel[]>([
    {
      id: 'email',
      name: 'Email Marketing',
      type: 'email',
      status: 'active',
      metrics: { sent: 2450, delivered: 2380, responses: 287, satisfaction: 4.2 }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      type: 'whatsapp',
      status: 'active',
      metrics: { sent: 1230, delivered: 1205, responses: 892, satisfaction: 4.7 }
    },
    {
      id: 'chat',
      name: 'Chat ao Vivo',
      type: 'chat',
      status: 'active',
      metrics: { sent: 0, delivered: 0, responses: 156, satisfaction: 4.5 }
    },
    {
      id: 'sms',
      name: 'SMS',
      type: 'sms',
      status: 'pending',
      metrics: { sent: 0, delivered: 0, responses: 0, satisfaction: 0 }
    }
  ]);

  const [tickets] = useState<SupportTicket[]>([
    {
      id: 'ticket-1',
      customer: 'Ana Silva',
      subject: 'Problema com pedido delivery',
      status: 'open',
      priority: 'high',
      channel: 'WhatsApp',
      created: '2024-03-20T14:30:00Z',
      lastUpdate: '2024-03-20T14:30:00Z'
    },
    {
      id: 'ticket-2',
      customer: 'Carlos Santos',
      subject: 'Solicitar reembolso',
      status: 'in-progress',
      priority: 'medium',
      channel: 'Email',
      created: '2024-03-20T10:15:00Z',
      lastUpdate: '2024-03-20T15:45:00Z'
    },
    {
      id: 'ticket-3',
      customer: 'Maria Costa',
      subject: 'Elogio ao atendimento',
      status: 'resolved',
      priority: 'low',
      channel: 'Chat',
      created: '2024-03-19T16:20:00Z',
      lastUpdate: '2024-03-20T09:30:00Z'
    }
  ]);

  const { toast } = useToast();

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />;
      case 'chat': return <MessageSquare className="w-5 h-5" />;
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive text-destructive-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSendMessage = () => {
    toast({
      title: "Mensagem enviada!",
      description: "Sua mensagem foi enviada com sucesso",
    });
  };

  const handleCreateTicket = () => {
    toast({
      title: "Ticket criado!",
      description: "O ticket de suporte foi criado com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Central de Comunicação</h1>
          <p className="text-muted-foreground">Gerencie todas as comunicações com seus clientes</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow">
          <Bot className="w-4 h-4 mr-2" />
          Configurar Chatbot
        </Button>
      </div>

      {/* Communication Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mensagens Enviadas</p>
                <p className="text-2xl font-bold text-foreground">
                  {channels.reduce((sum, c) => sum + c.metrics.sent, 0).toLocaleString()}
                </p>
              </div>
              <Send className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Resposta</p>
                <p className="text-2xl font-bold text-foreground">
                  {channels.reduce((sum, c) => sum + c.metrics.sent, 0) > 0 ? (
                    (channels.reduce((sum, c) => sum + c.metrics.responses, 0) / 
                    channels.reduce((sum, c) => sum + c.metrics.sent, 0) * 100).toFixed(1)
                  ) : '0'}%
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tickets Abertos</p>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length}
                </p>
              </div>
              <Headphones className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfação Média</p>
                <p className="text-2xl font-bold text-foreground">
                  {channels.length > 0 ? (
                    channels.reduce((sum, c) => sum + c.metrics.satisfaction, 0) / 
                    channels.filter(c => c.metrics.satisfaction > 0).length
                  ).toFixed(1) : '0'}⭐
                </p>
              </div>
              <Star className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="composer">Criar Mensagem</TabsTrigger>
          <TabsTrigger value="tickets">Tickets de Suporte</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getChannelIcon(channel.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                        <Badge className={getStatusColor(channel.status)}>
                          {channel.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Enviadas</span>
                      <span className="font-medium">{channel.metrics.sent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Entregues</span>
                      <span className="font-medium">{channel.metrics.delivered.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Respostas</span>
                      <span className="font-medium">{channel.metrics.responses.toLocaleString()}</span>
                    </div>
                    {channel.metrics.satisfaction > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Satisfação</span>
                        <span className="font-medium">{channel.metrics.satisfaction.toFixed(1)}⭐</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="composer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Canal de Comunicação</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">📧 Email</SelectItem>
                      <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                      <SelectItem value="sms">📱 SMS</SelectItem>
                      <SelectItem value="push">🔔 Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Segmento de Clientes</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      <SelectItem value="vip">Clientes VIP</SelectItem>
                      <SelectItem value="inactive">Clientes inativos</SelectItem>
                      <SelectItem value="recent">Clientes recentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Assunto</Label>
                <Input placeholder="Digite o assunto da mensagem..." />
              </div>
              
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea 
                  placeholder="Digite sua mensagem aqui..."
                  rows={6}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSendMessage} className="bg-gradient-to-r from-primary to-primary-glow">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Agora
                </Button>
                <Button variant="outline">Agendar Envio</Button>
                <Button variant="outline">Salvar Rascunho</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tickets de Suporte</CardTitle>
                <Button onClick={handleCreateTicket}>
                  <Users className="w-4 h-4 mr-2" />
                  Novo Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground">Por {ticket.customer} via {ticket.channel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getTicketStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Button variant="outline" size="sm">Ver Detalhes</Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Criado: {new Date(ticket.created).toLocaleDateString()}</span>
                      <span>Atualizado: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Automações Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Welcome Message</h4>
                    <Badge className="bg-success text-success-foreground">Ativo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mensagem automática enviada para novos clientes após primeira visita
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Trigger: Primeira visita</span>
                    <span>Delay: 2 horas</span>
                    <span>Canal: Email</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Feedback Follow-up</h4>
                    <Badge className="bg-success text-success-foreground">Ativo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Agradecimento automático após feedback positivo (4-5 estrelas)
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Trigger: Rating ≥ 4</span>
                    <span>Delay: 30 minutos</span>
                    <span>Canal: WhatsApp</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Recovery Campaign</h4>
                    <Badge className="bg-warning text-warning-foreground">Pausado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Campanha de reativação para clientes inativos há mais de 30 dias
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Trigger: 30 dias sem visita</span>
                    <span>Delay: Imediato</span>
                    <span>Canal: Email + SMS</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button className="bg-gradient-to-r from-primary to-primary-glow">
                  <Bot className="w-4 h-4 mr-2" />
                  Criar Nova Automação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}