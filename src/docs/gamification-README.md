# Customer Gamification System

## Overview

The customer gamification system is designed to increase customer engagement and loyalty through a points-based rewards system, achievements, events, and leaderboards.

## Features

### 1. Points System
Customers earn points for various activities:
- Submitting feedback
- Participating in events
- Making purchases
- Referring friends
- Daily check-ins

### 2. Achievements
Customers can unlock achievements for reaching milestones:
- Feedback milestones (10, 50, 100 feedbacks)
- Quality reviews (average rating 4.5+)
- Loyalty streaks (consecutive days of engagement)
- Social sharing

### 3. Badges
Visual representations of accomplishments with rarity levels:
- Common (gray)
- Rare (blue)
- Epic (purple)
- Legendary (gold)

### 4. Events
Time-limited challenges that offer bonus points and exclusive rewards:
- Feedback drives
- Seasonal promotions
- Engagement challenges
- Referral contests

### 5. Rewards
Points can be redeemed for various rewards:
- Discounts on future purchases
- Free items or services
- Exclusive experiences
- Early access to new products

### 6. Leaderboards
Rankings to encourage friendly competition:
- Overall points leaderboard
- Category-specific leaderboards
- Time-period leaderboards (daily, weekly, monthly)

## Architecture

### Frontend Components

1. **CustomerGamificationDashboard** - Main dashboard showing profile, points, badges, and achievements
2. **CustomerEventsHub** - List of available events with participation options
3. **CustomerRewardsHub** - Reward catalog and redemption history
4. **CustomerLayout** - Mobile-friendly layout for customer features

### Services

1. **CustomerGamificationService** - Service layer for gamification data operations
2. **useCustomerGamification** - React hook for managing gamification state

### Database Schema

1. **gamification_profiles** - Customer profiles with points, badges, and achievements
2. **rewards** - Catalog of available rewards
3. **reward_redemptions** - History of reward redemptions
4. **gamification_points** - History of point transactions
5. **Functions** - Database functions for point redemption and awarding

## Implementation Status

### ✅ Completed
- Frontend components for gamification dashboard
- Frontend components for events hub
- Frontend components for rewards hub
- Customer layout and navigation
- Customer routes
- Service layer with mock data
- React hook for gamification state

### 🔄 In Progress
- Database schema implementation
- Real data integration in service layer
- Backend functions for point redemption and awarding

### 🔜 Future Enhancements
- Social features (friend systems, challenges)
- Advanced analytics dashboard
- Notification system for achievements and events
- Mobile app integration
- Integration with existing feedback system

## API Endpoints

### Gamification Profiles
- `GET /api/gamification/profiles/:customerId` - Get customer profile
- `PUT /api/gamification/profiles/:customerId` - Update customer profile

### Events
- `GET /api/gamification/events` - List available events
- `POST /api/gamification/events/:eventId/participate` - Participate in event

### Rewards
- `GET /api/gamification/rewards` - List available rewards
- `POST /api/gamification/rewards/:rewardId/redeem` - Redeem reward

### Leaderboard
- `GET /api/gamification/leaderboard` - Get leaderboard entries

## Database Functions

### redeem_customer_reward
Redeems a reward for a customer, deducting the required points.

Parameters:
- `customer_id` (UUID)
- `reward_id` (UUID)
- `points_cost` (INTEGER)

### award_customer_points
Awards points to a customer for completing an action.

Parameters:
- `customer_id` (UUID)
- `points_amount` (INTEGER)
- `reason_text` (VARCHAR)
- `ref_type` (VARCHAR, optional)
- `ref_id` (UUID, optional)

## Usage Examples

### Displaying Customer Profile
```typescript
import { useCustomerGamification } from "@/hooks/useCustomerGamification";

const CustomerProfile = ({ customerId }) => {
  const { profile, loading, error } = useCustomerGamification({ customerId });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;
  
  return (
    <div>
      <h2>{profile.customerName}</h2>
      <p>Points: {profile.totalPoints}</p>
      <p>Level: {profile.level}</p>
    </div>
  );
};
```

### Redeeming a Reward
```typescript
import { useCustomerGamification } from "@/hooks/useCustomerGamification";

const RewardRedemption = ({ customerId }) => {
  const { rewards, redeemReward } = useCustomerGamification({ customerId });
  
  const handleRedeem = async (rewardId) => {
    const success = await redeemReward(rewardId);
    if (success) {
      alert("Reward redeemed successfully!");
    } else {
      alert("Failed to redeem reward");
    }
  };
  
  return (
    <div>
      {rewards.map(reward => (
        <div key={reward.id}>
          <h3>{reward.name}</h3>
          <p>{reward.description}</p>
          <p>Cost: {reward.cost} points</p>
          <button onClick={() => handleRedeem(reward.id)}>
            Redeem
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Testing

### Unit Tests
- Customer gamification service tests
- React hook tests
- Component tests

### Integration Tests
- Database function tests
- API endpoint tests
- End-to-end user flow tests

## Deployment

### Database Migration
Run the migration script to create the necessary tables and functions:
```bash
supabase migration up
```

### Frontend Deployment
The frontend components are automatically included in the main application build.

## Monitoring and Analytics

### Key Metrics
- Customer engagement rate
- Point redemption rate
- Event participation rate
- Leaderboard activity

### Dashboards
- Admin dashboard for gamification metrics
- Customer analytics dashboard
- Real-time event monitoring

## Troubleshooting

### Common Issues
1. **Points not updating** - Check database function permissions
2. **Rewards not redeeming** - Verify customer has sufficient points
3. **Leaderboard not updating** - Ensure materialized views are refreshed

### Debugging Tips
- Check browser console for frontend errors
- Check Supabase logs for database errors
- Verify RLS policies are correctly configured