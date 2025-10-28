export interface Campaign {
  id: string;
  tenantId: string;
  restaurantId?: string; // null for tenant-wide campaigns
  name: string;
  description: string;
  type: 'email' | 'sms' | 'push' | 'in-app' | 'social';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  targetAudience: {
    segment: 'all' | 'high-value' | 'inactive' | 'new' | 'custom';
    filters?: {
      rating?: { min: number; max: number };
      lastVisit?: { days: number };
      totalFeedback?: { min: number };
    };
  };
  content: {
    subject?: string;
    message: string;
    mediaUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
  };
  schedule?: {
    startDate: string;
    endDate?: string;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
  createdBy: string;
}

export interface Event {
  id: string;
  tenantId: string;
  restaurantIds: string[]; // Can be multiple restaurants
  name: string;
  description: string;
  type: 'promotion' | 'contest' | 'survey' | 'feedback-drive' | 'loyalty';
  status: 'upcoming' | 'active' | 'ended';
  startDate: string;
  endDate: string;
  rules: {
    participationRequirement: 'any' | 'feedback' | 'rating-threshold' | 'checkin';
    minRating?: number;
    maxParticipants?: number;
    requiresRegistration: boolean;
  };
  rewards: {
    type: 'discount' | 'freebie' | 'points' | 'badge' | 'cashback';
    value: string;
    description: string;
  };
  gamification: {
    pointsAwarded: number;
    badgeEarned?: string;
    leaderboardCategory?: string;
  };
  participants: EventParticipant[];
  metrics: {
    totalParticipants: number;
    feedbackGenerated: number;
    conversionRate: number;
    engagementScore: number;
  };
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  customerEmail?: string;
  customerName?: string;
  restaurantId: string;
  participatedAt: string;
  rewardClaimed: boolean;
  feedbackSubmitted?: string; // feedback ID if applicable
}

export interface GamificationProfile {
  id: string;
  tenantId: string;
  restaurantId: string;
  customerEmail: string;
  customerName?: string;
  totalPoints: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
  streaks: {
    current: number;
    longest: number;
    lastActivity: string;
  };
  stats: {
    totalFeedback: number;
    averageRating: number;
    totalVisits: number;
    eventParticipations: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'feedback' | 'loyalty' | 'social' | 'quality';
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  reward: {
    points: number;
    badge?: string;
  };
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'points' | 'feedback' | 'ratings' | 'visits';
  entries: LeaderboardEntry[];
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  customerName: string;
  restaurantName: string;
  score: number;
  change: number; // position change from last period
  badge?: string;
}