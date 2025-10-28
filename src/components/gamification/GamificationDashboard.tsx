import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GamificationProfile, Leaderboard, LeaderboardEntry } from "@/types/campaigns";
import { Trophy, Medal, Award, Star, TrendingUp, Users, Target, Zap, Crown, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GamificationDashboard() {
  const [profiles, setProfiles] = useState<GamificationProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("monthly");
  const [selectedCategory, setSelectedCategory] = useState<string>("points");

  useEffect(() => {
    // Load gamification data from localStorage or create mock data
    const savedProfiles = JSON.parse(localStorage.getItem('gamificationProfiles') || '[]');
    
    if (savedProfiles.length === 0) {
      const mockProfiles: GamificationProfile[] = [
        {
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
        },
        {
          id: 'profile-2',
          tenantId: 'tenant-1',
          restaurantId: 'rest-1',
          customerEmail: 'carlos.santos@email.com',
          customerName: 'Carlos Santos',
          totalPoints: 1950,
          level: 6,
          badges: [
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
              id: 'achievement-2',
              name: 'Social Butterfly',
              description: 'Compartilhar 10 experiências',
              category: 'social',
              progress: 6,
              target: 10,
              completed: false,
              reward: { points: 200, badge: 'Social Star' }
            }
          ],
          streaks: {
            current: 5,
            longest: 15,
            lastActivity: '2024-03-19T20:30:00Z'
          },
          stats: {
            totalFeedback: 34,
            averageRating: 4.2,
            totalVisits: 23,
            eventParticipations: 8
          },
          createdAt: '2024-02-01T11:00:00Z',
          updatedAt: '2024-03-19T20:30:00Z'
        }
      ];
      
      localStorage.setItem('gamificationProfiles', JSON.stringify(mockProfiles));
      setProfiles(mockProfiles);
    } else {
      setProfiles(savedProfiles);
    }

    // Generate leaderboard
    generateLeaderboard(selectedPeriod, selectedCategory);
  }, [selectedPeriod, selectedCategory]);

  const generateLeaderboard = (period: string, category: string) => {
    const entries: LeaderboardEntry[] = profiles.map((profile, index) => {
      let score = 0;
      switch (category) {
        case 'points':
          score = profile.totalPoints;
          break;
        case 'feedback':
          score = profile.stats.totalFeedback;
          break;
        case 'ratings':
          score = profile.stats.averageRating;
          break;
        case 'visits':
          score = profile.stats.totalVisits;
          break;
      }

      return {
        rank: index + 1,
        customerName: profile.customerName || 'Cliente Anônimo',
        restaurantName: 'Sabor & Arte', // Mock
        score: score,
        change: Math.floor(Math.random() * 6) - 3, // Random change
        badge: profile.badges[0]?.iconUrl
      };
    }).sort((a, b) => b.score - a.score);

    // Update ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const leaderboardData: Leaderboard = {
      period: period as any,
      category: category as any,
      entries: entries,
      updatedAt: new Date().toISOString()
    };

    setLeaderboard(leaderboardData);
  };

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

  const totalProfiles = profiles.length;
  const averageLevel = profiles.length > 0 ? profiles.reduce((sum, p) => sum + p.level, 0) / profiles.length : 0;
  const totalBadges = profiles.reduce((sum, p) => sum + p.badges.length, 0);
  const activeStreaks = profiles.filter(p => p.streaks.current > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gamificação</h1>
          <p className="text-muted-foreground">Sistema de pontos, badges e leaderboards</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow">
          <Gift className="w-4 h-4 mr-2" />
          Configurar Recompensas
        </Button>
      </div>

      {/* Gamification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jogadores Ativos</p>
                <p className="text-2xl font-bold text-foreground">{totalProfiles}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nível Médio</p>
                <p className="text-2xl font-bold text-foreground">{averageLevel.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Badges Conquistados</p>
                <p className="text-2xl font-bold text-foreground">{totalBadges}</p>
              </div>
              <Trophy className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Streaks Ativos</p>
                <p className="text-2xl font-bold text-foreground">{activeStreaks}</p>
              </div>
              <Zap className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="players">Jogadores</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Ranking dos Melhores
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="all-time">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Pontos</SelectItem>
                      <SelectItem value="feedback">Feedbacks</SelectItem>
                      <SelectItem value="ratings">Avaliações</SelectItem>
                      <SelectItem value="visits">Visitas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.entries.map((entry, index) => (
                  <div key={index} className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    index < 3 ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/20" : "bg-muted/50"
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

        <TabsContent value="players" className="space-y-6">
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <Card key={profile.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="" />
                        <AvatarFallback>{profile.customerName?.split(' ').map(n => n[0]).join('') || 'AN'}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-medium">{profile.customerName || 'Cliente Anônimo'}</h3>
                          <p className="text-sm text-muted-foreground">{profile.customerEmail}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={cn("font-bold", getLevelColor(profile.level))}>
                            Nível {profile.level}
                          </span>
                          <span>{profile.totalPoints.toLocaleString()} pontos</span>
                          <span>Streak: {profile.streaks.current} dias</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Ver Perfil</Button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{profile.stats.totalFeedback}</p>
                      <p className="text-xs text-muted-foreground">Feedbacks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{profile.stats.averageRating.toFixed(1)} ⭐</p>
                      <p className="text-xs text-muted-foreground">Avaliação Média</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{profile.stats.totalVisits}</p>
                      <p className="text-xs text-muted-foreground">Visitas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{profile.badges.length}</p>
                      <p className="text-xs text-muted-foreground">Badges</p>
                    </div>
                  </div>

                  {profile.badges.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Badges Recentes</p>
                      <div className="flex gap-2">
                        {profile.badges.slice(0, 3).map((badge) => (
                          <Badge key={badge.id} className={getRarityColor(badge.rarity)}>
                            {badge.iconUrl} {badge.name}
                          </Badge>
                        ))}
                        {profile.badges.length > 3 && (
                          <Badge variant="outline">+{profile.badges.length - 3} mais</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso de Conquistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.flatMap(p => p.achievements).map((achievement) => (
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.flatMap(p => p.badges).map((badge) => (
                  <Card key={badge.id} className="p-4">
                    <div className="text-center space-y-2">
                      <div className="text-4xl">{badge.iconUrl}</div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      <Badge className={getRarityColor(badge.rarity)}>
                        {badge.rarity}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}