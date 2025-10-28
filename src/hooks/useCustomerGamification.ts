import { useState, useEffect } from "react";
import { customerGamificationService } from "@/services/customerGamificationService";
import { GamificationProfile, Event } from "@/types/campaigns";

interface UseCustomerGamificationProps {
  customerId: string;
}

export const useCustomerGamification = ({ customerId }: UseCustomerGamificationProps) => {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          profileData,
          eventsData,
          rewardsData,
          redemptionHistoryData,
          leaderboardData
        ] = await Promise.all([
          customerGamificationService.getCustomerProfile(customerId),
          customerGamificationService.getAvailableEvents(customerId),
          customerGamificationService.getAvailableRewards(customerId),
          customerGamificationService.getRedemptionHistory(customerId),
          customerGamificationService.getLeaderboard()
        ]);

        setProfile(profileData);
        setEvents(eventsData);
        setRewards(rewardsData);
        setRedemptionHistory(redemptionHistoryData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("Error fetching gamification data:", err);
        setError("Failed to load gamification data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const redeemReward = async (rewardId: string) => {
    try {
      const success = await customerGamificationService.redeemReward(customerId, rewardId);
      if (success) {
        // Refresh profile and rewards after redemption
        const [profileData, rewardsData] = await Promise.all([
          customerGamificationService.getCustomerProfile(customerId),
          customerGamificationService.getAvailableRewards(customerId)
        ]);
        
        setProfile(profileData);
        setRewards(rewardsData);
        
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error redeeming reward:", err);
      return false;
    }
  };

  const participateInEvent = async (eventId: string) => {
    try {
      const success = await customerGamificationService.participateInEvent(customerId, eventId);
      if (success) {
        // Refresh events after participation
        const eventsData = await customerGamificationService.getAvailableEvents(customerId);
        setEvents(eventsData);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error participating in event:", err);
      return false;
    }
  };

  return {
    profile,
    events,
    rewards,
    redemptionHistory,
    leaderboard,
    loading,
    error,
    redeemReward,
    participateInEvent
  };
};