import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  Crown, 
  Gift,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GamificationProfile, LeaderboardEntry, Achievement } from "@/types/campaigns";

export default function CustomerGamificationDashboard() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, we'll use mock data
    const mockProfile: GamificationProfile = {
      id: 'profile-1',
      tenantId: 'tenant-1',
      restaurantId: 'rest-1',
      customerEmail: 'ana.silva@email.com',
      customerName: 'Ana Silva',
      totalPoints: 2850,
      level: 8,
      badges: [
        {
          id: 'badge-1',
          name: 'Feedback Master',
          description: '50+ feedbacks enviados',
          iconUrl: '🏆',
          earnedAt: '2024-03-01T10:00:00Z',
          rarity: 'epic'
        },
        {
          id: 'badge-2',
          name: 'Quality Reviewer',
          description: 'Média de 4.5+ estrelas',
          iconUrl: '⭐',
          earnedAt: '2024-02-15T14:30:00Z',
          rarity: 'rare'
        },
        {
          id: 'badge-3',
          name: 'Loyal Customer',
          description: '20+ visitas',
          iconUrl: '💎',
          earnedAt: '2024-02-28T16:00:00Z',
          rarity: 'rare'
        }
      ],
      achievements: [
        {
          id: 'achievement-1',
          name: 'Century Club',
          description: 'Enviar 100 feedbacks',
          category: 'feedback',
          progress: 78,
          target: 100,
          completed: false,
          reward: { points: 500, badge: 'Century Master' }
        },
        {
          id: 'achievement-2',
          name: 'Social Butterfly',
          description: 'Compartilhar 10 experiências',
          category: 'social',
          progress: 6,
          target: 10,
          completed: false,
          reward: { points: 200, badge: 'Social Star' }
        },
        {
          id: 'achievement-3',
          name: 'Perfect Ten',
          description: 'Dar 10 avaliações 5 estrelas',
          category: 'quality',
          progress: 10,
          target: 10,
          completed: true,
          completedAt: '2024-03-15T10:00:00Z',
          reward: { points: 300, badge: 'Perfectionist' }
        }
      ],
      streaks: {
        current: 12,
        longest: 28,
        lastActivity: '2024-03-20T18:00:00Z'
      },
      stats: {
        totalFeedback: 78,
        averageRating: 4.6,
        totalVisits: 45,
        eventParticipations: 12
      },
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-03-20T18:00:00Z'
    };

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        customerName: 'Carlos Santos',
        restaurantName: 'Sabor & Arte',
        score: 3200,
        change: 2,
        badge: '👑'
      },
      {
        rank: 2,
        customerName: 'Ana Silva',
        restaurantName: 'Sabor & Arte',
        score: 2850,
        change: -1,
        badge: '🏆'
      },
      {
        rank: 3,
        customerName: 'Roberto Lima',
        restaurantName: 'Sabor & Arte',
        score: 2750,
        change: 0,
        badge: '💎'
      },
      {
        rank: 4,
        customerName: 'Mariana Costa',
        restaurantName: 'Sabor & Arte',
        score: 2600,
        change: 1,
        badge: '⭐'
      },
      {
        rank: 5,
        customerName: 'Pedro Alves',
        restaurantName: 'Sabor & Arte',
        score: 2400,
        change: -2,
        badge: '🔥'
      }
    ];

    setProfile(mockProfile);
    setLeaderboard(mockLeaderboard);
  }, []);

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'text-yellow-500'; // Gold
    if (level >= 7) return 'text-purple-500'; // Purple
    if (level >= 5) return 'text-blue-500'; // Blue
    if (level >= 3) return 'text-green-500'; // Green
    return 'text-gray-500'; // Gray
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'common': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil de Gamificação</h1>
          <p className="text-muted-foreground">Acompanhe seus pontos, badges e conquistas</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow">
          <Gift className="w-4 h-4 mr-2" />
          Resgatar Recompensas
        </Button>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl">{profile.customerName?.split(' ').map(n => n[0]).join('') || 'AN'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{profile.customerName}</h2>
              <p className="text-muted-foreground mb-4">{profile.customerEmail}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="text-center">
                  <p className={cn("text-2xl font-bold", getLevelColor(profile.level))}>
                    Nível {profile.level}
                  </p>
                  <p className="text-sm text-muted-foreground">Nível Atual</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{profile.totalPoints.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Pontos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{profile.streaks.current}</p>
                  <p className="text-sm text-muted-foreground">Streak (dias)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{profile.badges.length}</p>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Feedbacks</p>
                    <p className="text-2xl font-bold text-foreground">{profile.stats.totalFeedback}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                    <p className="text-2xl font-bold text-foreground">{profile.stats.averageRating.toFixed(1)} ⭐</p>
                  </div>
                  <Star className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Visitas</p>
                    <p className="text-2xl font-bold text-foreground">{profile.stats.totalVisits}</p>
                  </div>
                  <Users className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Eventos</p>
                    <p className="text-2xl font-bold text-foreground">{profile.stats.eventParticipations}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress to Next Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Progresso para o Próximo Nível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nível {profile.level} → Nível {profile.level + 1}</span>
                  <span className="text-sm font-medium">350 / 1000 pontos</span>
                </div>
                <Progress value={35} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Você precisa de mais 650 pontos para alcançar o próximo nível. Continue enviando feedbacks!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Conquistas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {achievement.completed ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : (
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      )}
                      <div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <Badge variant={achievement.completed ? "default" : "outline"}>
                      {achievement.completed ? "Completo" : "Em progresso"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Conquistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant={achievement.completed ? "default" : "outline"}>
                        {achievement.completed ? "Completo" : "Em progresso"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progresso</span>
                        <span>{achievement.progress}/{achievement.target}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Recompensa: {achievement.reward.points} pontos
                      {achievement.reward.badge && ` + Badge "${achievement.reward.badge}"`}
                    </div>
                    {achievement.completed && achievement.completedAt && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Concluído em: {new Date(achievement.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.badges.map((badge) => (
                  <Card key={badge.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="text-center space-y-2">
                      <div className="text-4xl">{badge.iconUrl}</div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      <Badge className={getRarityColor(badge.rarity)}>
                        {badge.rarity}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Conquistado em: {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Ranking dos Melhores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    entry.rank === 2 ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/20" : "bg-muted/50"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(entry.rank)}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" />
                        <AvatarFallback>{entry.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{entry.customerName}</p>
                        <p className="text-sm text-muted-foreground">{entry.restaurantName}</p>
                      </div>
                      {entry.badge && (
                        <span className="text-lg">{entry.badge}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
                      {entry.change !== 0 && (
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          entry.change > 0 ? "text-success" : "text-destructive"
                        )}>
                          <TrendingUp className={cn("w-3 h-3", entry.change < 0 && "rotate-180")} />
                          <span>{Math.abs(entry.change)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}