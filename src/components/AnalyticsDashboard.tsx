// DigaZÉ - Analytics Dashboard Component
// Component to display analytics using the materialized view

import { useState, useEffect } from 'react'
import { analyticsService } from '@/lib/supabase-enhanced-services'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TrendingUp, MessageSquare, Star, Smile, Frown, Meh } from 'lucide-react'

const COLORS = ['#10B981', '#F59E0B', '#EF4444']

export function AnalyticsDashboard() {
  const [dailySummary, setDailySummary] = useState<any[]>([])
  const [tenantAnalytics, setTenantAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch daily feedback summary
        const summary = await analyticsService.getDailyFeedbackSummary()
        setDailySummary(summary || [])
        
        // Fetch tenant analytics summary
        const analytics = await analyticsService.getTenantAnalyticsSummary(user.tenant_id)
        setTenantAnalytics(analytics)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="h-80">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <Card className="h-80">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Prepare data for charts
  const sentimentData = tenantAnalytics ? [
    { name: 'Positivo', value: tenantAnalytics.positive_sentiment_pct },
    { name: 'Neutro', value: 100 - tenantAnalytics.positive_sentiment_pct - (tenantAnalytics.negative_sentiment_pct || 0) },
    { name: 'Negativo', value: tenantAnalytics.negative_sentiment_pct || 0 }
  ] : []

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Feedbacks</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantAnalytics?.total_feedbacks?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>NPS Médio</CardDescription>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantAnalytics?.avg_nps_score ? tenantAnalytics.avg_nps_score.toFixed(1) : '0.0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avaliação Média</CardDescription>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantAnalytics?.avg_rating ? tenantAnalytics.avg_rating.toFixed(1) : '0.0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sentimento Positivo</CardDescription>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantAnalytics?.positive_sentiment_pct ? `${tenantAnalytics.positive_sentiment_pct.toFixed(1)}%` : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Feedback Trend */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Tendência de Feedbacks (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={dailySummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="feedback_date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Feedbacks']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                />
                <Bar dataKey="total_feedbacks" fill="#3b82f6" name="Feedbacks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Distribuição de Sentimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Percentual']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <Smile className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm">Positivo</span>
              </div>
              <div className="flex items-center">
                <Meh className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm">Neutro</span>
              </div>
              <div className="flex items-center">
                <Frown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm">Negativo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tenantAnalytics?.total_campaigns?.toLocaleString() || '0'}</div>
            <p className="text-muted-foreground">Total de campanhas enviadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tenantAnalytics?.total_events?.toLocaleString() || '0'}</div>
            <p className="text-muted-foreground">Eventos ativos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tenantAnalytics?.active_users_count?.toLocaleString() || '0'}</div>
            <p className="text-muted-foreground">Nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}