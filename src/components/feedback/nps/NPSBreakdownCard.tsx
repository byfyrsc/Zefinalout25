import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import type { NPSMetrics } from '@/types/feedback';

interface NPSBreakdownCardProps {
  metrics: NPSMetrics;
}

const NPS_COLORS = {
  promoter: '#22c55e',
  passive: '#f59e0b',
  detractor: '#ef4444',
};

export const NPSBreakdownCard = ({ metrics }: NPSBreakdownCardProps) => {
  const total = metrics.total_responses;
  const promoterPercentage = total > 0 ? (metrics.promoters / total) * 100 : 0;
  const passivePercentage = total > 0 ? (metrics.passives / total) * 100 : 0;
  const detractorPercentage = total > 0 ? (metrics.detractors / total) * 100 : 0;

  const pieData = [
    { name: 'Promotores', value: metrics.promoters, percentage: promoterPercentage, color: NPS_COLORS.promoter },
    { name: 'Neutros', value: metrics.passives, percentage: passivePercentage, color: NPS_COLORS.passive },
    { name: 'Detratores', value: metrics.detractors, percentage: detractorPercentage, color: NPS_COLORS.detractor },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Distribuição NPS</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bars */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Promotores (9-10)</span>
                </div>
                <span className="font-medium">
                  {metrics.promoters} ({promoterPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={promoterPercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Neutros (7-8)</span>
                </div>
                <span className="font-medium">
                  {metrics.passives} ({passivePercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={passivePercentage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Detratores (0-6)</span>
                </div>
                <span className="font-medium">
                  {metrics.detractors} ({detractorPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={detractorPercentage} className="h-2" />
            </div>
          </div>
          
          {/* Pie Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} (${((value / total) * 100).toFixed(1)}%)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};