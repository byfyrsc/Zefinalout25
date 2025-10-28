import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  Coins, 
  Ticket, 
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'discount' | 'freebie' | 'cashback' | 'exclusive';
  status: 'available' | 'claimed' | 'expired';
  expiryDate?: string;
  claimedAt?: string;
}

interface RedemptionHistory {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsUsed: number;
  redeemedAt: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function CustomerRewardsHub() {
  const [points, setPoints] = useState(2850);
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 'reward-1',
      name: '10% de Desconto',
      description: 'Desconto em qualquer pedido',
      cost: 500,
      type: 'discount',
      status: 'available'
    },
    {
      id: 'reward-2',
      name: 'Bebida Grátis',
      description: 'Uma bebida à sua escolha',
      cost: 300,
      type: 'freebie',
      status: 'available'
    },
    {
      id: 'reward-3',
      name: 'Pizza Grátis',
      description: 'Pizza individual de sua preferência',
      cost: 800,
      type: 'freebie',
      status: 'available'
    },
    {
      id: 'reward-4',
      name: '20% de Desconto',
      description: 'Desconto especial para clientes VIP',
      cost: 1000,
      type: 'discount',
      status: 'claimed',
      claimedAt: '2024-03-15'
    },
    {
      id: 'reward-5',
      name: 'Acesso ao Clube VIP',
      description: 'Benefícios exclusivos para membros VIP',
      cost: 2000,
      type: 'exclusive',
      status: 'available'
    }
  ]);

  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistory[]>([
    {
      id: 'redeem-1',
      rewardId: 'reward-4',
      rewardName: '20% de Desconto',
      pointsUsed: 1000,
      redeemedAt: '2024-03-15T14:30:00Z',
      status: 'completed'
    },
    {
      id: 'redeem-2',
      rewardId: 'reward-2',
      rewardName: 'Bebida Grátis',
      pointsUsed: 300,
      redeemedAt: '2024-03-10T19:15:00Z',
      status: 'completed'
    }
  ]);

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Ticket className="w-5 h-5" />;
      case 'freebie': return <Gift className="w-5 h-5" />;
      case 'cashback': return <Coins className="w-5 h-5" />;
      case 'exclusive': return <ShoppingCart className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'discount': return 'Desconto';
      case 'freebie': return 'Brinde';
      case 'cashback': return 'Cashback';
      case 'exclusive': return 'Exclusivo';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'claimed': return 'bg-muted text-muted-foreground';
      case 'expired': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || reward.status !== 'available' || points < reward.cost) return;

    // Update points
    setPoints(prev => prev - reward.cost);

    // Update reward status
    setRewards(prev => 
      prev.map(r => 
        r.id === rewardId ? { ...r, status: 'claimed', claimedAt: new Date().toISOString() } : r
      )
    );

    // Add to redemption history
    const newRedemption: RedemptionHistory = {
      id: `redeem-${Date.now()}`,
      rewardId,
      rewardName: reward.name,
      pointsUsed: reward.cost,
      redeemedAt: new Date().toISOString(),
      status: 'completed'
    };

    setRedemptionHistory(prev => [newRedemption, ...prev]);
  };

  const availableRewards = rewards.filter(r => r.status === 'available');
  const claimedRewards = rewards.filter(r => r.status === 'claimed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Pontos e Recompensas</h1>
          <p className="text-muted-foreground">Resgate recompensas com seus pontos acumulados</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Seus pontos</p>
          <p className="text-3xl font-bold text-primary">{points.toLocaleString()}</p>
        </div>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pontos Disponíveis</p>
                <p className="text-2xl font-bold text-foreground">{points.toLocaleString()}</p>
              </div>
              <Coins className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recompensas Disponíveis</p>
                <p className="text-2xl font-bold text-foreground">{availableRewards.length}</p>
              </div>
              <Gift className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resgates Realizados</p>
                <p className="text-2xl font-bold text-foreground">{redemptionHistory.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Recompensas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRewards.map((reward) => (
              <Card key={reward.id} className="hover:shadow-medium transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getRewardTypeIcon(reward.type)}
                    </div>
                    <Badge className={getStatusColor(reward.status)}>
                      {reward.cost} pts
                    </Badge>
                  </div>
                  <h3 className="font-medium mb-1">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {getRewardTypeLabel(reward.type)}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleRedeemReward(reward.id)}
                      disabled={points < reward.cost}
                    >
                      Resgatar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {availableRewards.length === 0 && (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma recompensa disponível</h3>
              <p className="text-muted-foreground">Continue acumulando pontos para desbloquear recompensas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claimed Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Recompensas Resgatadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {claimedRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getRewardTypeIcon(reward.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{reward.name}</h4>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    {reward.claimedAt && (
                      <p className="text-xs text-muted-foreground">
                        Resgatado em: {new Date(reward.claimedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary">
                  Resgatado
                </Badge>
              </div>
            ))}
          </div>
          
          {claimedRewards.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma recompensa resgatada</h3>
              <p className="text-muted-foreground">Suas recompensas resgatadas aparecerão aqui</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redemption History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Histórico de Resgates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {redemptionHistory.map((redemption) => (
              <div key={redemption.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{redemption.rewardName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(redemption.redeemedAt).toLocaleDateString()} às {new Date(redemption.redeemedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">-{redemption.pointsUsed} pts</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {redemption.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          {redemptionHistory.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhum resgate realizado</h3>
              <p className="text-muted-foreground">Seu histórico de resgates aparecerá aqui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}