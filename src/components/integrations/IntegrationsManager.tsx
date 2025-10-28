import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plug,
  CheckCircle,
  AlertTriangle,
  Settings,
  ExternalLink,
  Plus,
  Database,
  ShoppingCart,
  MessageSquare,
  Users,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'pos' | 'crm' | 'delivery' | 'social_media' | 'analytics';
  status: 'connected' | 'disconnected' | 'pending';
  icon: React.ComponentType<{ className?: string }>;
  configUrl?: string;
  docsUrl?: string;
}

const mockIntegrations: Integration[] = [
  {
    id: 'pos-toast',
    name: 'Toast POS',
    description: 'Sincronize vendas e dados de pedidos em tempo real.',
    category: 'pos',
    status: 'disconnected',
    icon: ShoppingCart,
    configUrl: '/integrations/toast-pos/config',
    docsUrl: 'https://pos.toasttab.com/docs',
  },
  {
    id: 'crm-hubspot',
    name: 'HubSpot CRM',
    description: 'Sincronize contatos de clientes e enriqueça dados automaticamente.',
    category: 'crm',
    status: 'connected',
    icon: Users,
    configUrl: '/integrations/hubspot/config',
    docsUrl: 'https://developers.hubspot.com/',
  },
  {
    id: 'delivery-ifood',
    name: 'iFood',
    description: 'Importe pedidos automaticamente e vincule feedback a entregas.',
    category: 'delivery',
    status: 'pending',
    icon: MessageSquare, // Using MessageSquare as a placeholder for a delivery icon
    configUrl: '/integrations/ifood/config',
    docsUrl: 'https://developer.ifood.com.br/',
  },
  {
    id: 'social-google-my-business',
    name: 'Google My Business',
    description: 'Publique avaliações positivas e gerencie sua reputação online.',
    category: 'social_media',
    status: 'connected',
    icon: ExternalLink, // Using ExternalLink as a placeholder for GMB icon
    configUrl: '/integrations/gmb/config',
    docsUrl: 'https://developers.google.com/my-business',
  },
  {
    id: 'pos-square',
    name: 'Square POS',
    description: 'Integre dados de vendas e transações para análise.',
    category: 'pos',
    status: 'disconnected',
    icon: ShoppingCart,
    configUrl: '/integrations/square-pos/config',
    docsUrl: 'https://developer.squareup.com/',
  },
];

export const IntegrationsManager = () => {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-success text-success-foreground">Conectado</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Desconectado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const handleConnect = (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id ? { ...integration, status: 'connected' } : integration
    ));
    // In a real app, this would trigger an OAuth flow or API key setup
    console.log(`Connecting to ${id}`);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id ? { ...integration, status: 'disconnected' } : integration
    ));
    console.log(`Disconnecting from ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Integrações</h2>
          <p className="text-muted-foreground">Conecte o DigaZÉ com seus sistemas favoritos.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="flex flex-col justify-between h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                {getStatusBadge(integration.status)}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                <div className="flex flex-col gap-2">
                  {integration.status === 'connected' ? (
                    <Button variant="outline" onClick={() => handleDisconnect(integration.id)}>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Desconectar
                    </Button>
                  ) : (
                    <Button onClick={() => handleConnect(integration.id)}>
                      <Plug className="mr-2 h-4 w-4" />
                      Conectar
                    </Button>
                  )}
                  {integration.configUrl && (
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href={integration.configUrl}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar
                      </a>
                    </Button>
                  )}
                  {integration.docsUrl && (
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Documentação
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};