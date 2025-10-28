import { GamificationProfile, Event, Badge, Achievement } from "@/types/campaigns";
import { supabase } from "@/lib/supabase";

// Define types for rewards and redemption history
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

export class CustomerGamificationService {
  /**
   * Get customer gamification profile
   */
  async getCustomerProfile(customerId: string): Promise<GamificationProfile | null> {
    try {
      const { data, error } = await supabase
        .from('gamification_profiles')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (error) throw error;
      
      // Map to GamificationProfile type
      return {
        id: data.id,
        tenantId: data.tenant_id,
        restaurantId: '', // Not in schema
        customerEmail: '', // Not in schema
        customerName: '', // Not in schema
        totalPoints: data.total_points,
        level: data.level,
        badges: data.badges as Badge[],
        achievements: data.achievements as Achievement[],
        streaks: data.streaks,
        stats: data.stats,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
  }

  /**
   * Get available events for customer
   */
  async getAvailableEvents(customerId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('ends_at', new Date().toISOString());

      if (error) throw error;
      
      // Map to Event type
      return data.map(item => ({
        id: item.id,
        tenantId: item.tenant_id,
        restaurantIds: [], // Not in schema
        name: item.name,
        description: item.description,
        type: 'feedback-drive', // Default type
        status: item.status === 'ongoing' ? 'active' : item.status === 'published' ? 'upcoming' : 'ended',
        startDate: item.starts_at,
        endDate: item.ends_at,
        rules: {
          participationRequirement: 'any',
          requiresRegistration: false
        },
        rewards: {
          type: 'points',
          value: '100',
          description: '100 pontos'
        },
        gamification: {
          pointsAwarded: 100,
          badgeEarned: 'Event Participant'
        },
        participants: [],
        metrics: {
          totalParticipants: item.metrics?.participants || 0,
          feedbackGenerated: item.metrics?.completions || 0,
          conversionRate: item.metrics?.engagement_rate || 0,
          engagementScore: 0
        },
        createdAt: item.created_at
      })) as Event[];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  /**
   * Get available rewards for customer
   */
  async getAvailableRewards(customerId: string): Promise<Reward[]> {
    try {
      // First get customer's current points
      const profile = await this.getCustomerProfile(customerId);
      if (!profile) return [];

      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('status', 'active')
        .lte('cost', profile.totalPoints);

      if (error) throw error;
      
      // Map to Reward type
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        cost: item.cost,
        type: item.type as 'discount' | 'freebie' | 'cashback' | 'exclusive',
        status: item.status as 'available' | 'claimed' | 'expired',
        expiryDate: item.expires_at,
        claimedAt: undefined
      }));
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }
  }

  /**
   * Get customer's redemption history
   */
  async getRedemptionHistory(customerId: string): Promise<RedemptionHistory[]> {
    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          reward:rewards(name)
        `)
        .eq('customer_id', customerId)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      
      // Map to RedemptionHistory format
      return data.map(item => ({
        id: item.id,
        rewardId: item.reward_id,
        rewardName: item.reward?.name || 'Recompensa',
        pointsUsed: item.points_used,
        redeemedAt: item.redeemed_at,
        status: item.status as 'completed' | 'pending' | 'cancelled'
      }));
    } catch (error) {
      console.error('Error fetching redemption history:', error);
      return [];
    }
  }

  /**
   * Redeem a reward
   */
  async redeemReward(customerId: string, rewardId: string): Promise<boolean> {
    try {
      // Call the database function to redeem the reward
      const { data, error } = await supabase.rpc('redeem_customer_reward', {
        customer_id: customerId,
        reward_id: rewardId,
        points_cost: 100 // This should be dynamically fetched from the reward
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return false;
    }
  }

  /**
   * Participate in an event
   */
  async participateInEvent(customerId: string, eventId: string): Promise<boolean> {
    try {
      // For now, we'll just log the participation
      // In a full implementation, this would update the event metrics
      console.log(`Customer ${customerId} participating in event ${eventId}`);
      return true;
    } catch (error) {
      console.error('Error participating in event:', error);
      return false;
    }
  }

  /**
   * Get customer leaderboard position
   */
  async getLeaderboardPosition(customerId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('gamification_profiles')
        .select('id, total_points')
        .order('total_points', { ascending: false });

      if (error) throw error;
      
      const customerIndex = data.findIndex(profile => profile.id === customerId);
      return customerIndex >= 0 ? customerIndex + 1 : null;
    } catch (error) {
      console.error('Error fetching leaderboard position:', error);
      return null;
    }
  }

  /**
   * Get top leaderboard entries
   */
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('gamification_profiles')
        .select('customer_name, total_points')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}

// Export singleton instance
export const customerGamificationService = new CustomerGamificationService();