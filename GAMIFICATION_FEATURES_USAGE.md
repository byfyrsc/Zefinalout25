# Gamification Features Usage Guide

## Overview

This document provides instructions on how to use the newly implemented gamification features for customers in the InteliFeed Hub application.

## New Customer-Facing Features

### 1. Customer Gamification Dashboard
Accessible at `/customer/gamification`

Features:
- Points and level display
- Badge showcase with rarity indicators
- Achievement tracking with progress bars
- Customer statistics (feedback count, average rating, etc.)
- Leaderboard integration

### 2. Customer Events Hub
Accessible at `/customer/events`

Features:
- List of available events
- Event participation functionality
- Event details (type, status, requirements)
- Progress tracking for ongoing events

### 3. Customer Rewards Hub
Accessible at `/customer/rewards`

Features:
- Reward catalog with point costs
- Reward redemption functionality
- Redemption history tracking
- Points balance display

## How to Access the Features

### For Development Testing

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to:
   - Gamification Dashboard: http://localhost:8080/customer/gamification
   - Events Hub: http://localhost:8080/customer/events
   - Rewards Hub: http://localhost:8080/customer/rewards

### For Production Deployment

1. Build the application:
   ```
   npm run build
   ```

2. Serve the built application:
   ```
   npm run preview
   ```

## Database Migration

The gamification features require the following database tables:

1. `gamification_profiles` - Stores customer gamification data
2. `rewards` - Catalog of available rewards
3. `reward_redemptions` - History of reward redemptions
4. `gamification_points` - History of point transactions

To apply the migration:

1. Ensure you have the Supabase CLI installed
2. Run the migration:
   ```
   supabase migration up
   ```

## Testing the Features

### Component Tests

The components have basic tests in:
- `src/components/gamification/__tests__/CustomerGamificationDashboard.test.tsx`
- `src/components/events/__tests__/CustomerEventsHub.test.tsx`
- `src/components/gamification/__tests__/CustomerRewardsHub.test.tsx`

To run the tests:
```
npm run test:run
```

### Manual Testing

1. Navigate to each customer gamification page
2. Verify that the components render correctly
3. Check that the mock data is displayed properly
4. Ensure mobile responsiveness works as expected

## Integration with Existing Systems

### Authentication

The customer gamification features are protected by the existing authentication system. Customers must be logged in to access these features.

### Feedback System

Points can be awarded for feedback submission through the existing feedback system. The `award_customer_points` function can be called when feedback is submitted.

### Analytics

Gamification metrics are tracked and can be viewed in the analytics dashboard.

## Customization

### Branding

The components use the existing theme system and can be customized through Tailwind CSS classes.

### Rewards

New rewards can be added by inserting records into the `rewards` table.

### Events

New events can be added by inserting records into the `events` table.

## Troubleshooting

### Common Issues

1. **Components not rendering**: Check that the routes are properly configured in `src/routes/customerRoutes.tsx`
2. **Database errors**: Verify that the migration has been applied and the tables exist
3. **Styling issues**: Ensure Tailwind CSS is properly configured

### Debugging Tips

1. Check the browser console for JavaScript errors
2. Verify network requests in the browser's developer tools
3. Check Supabase logs for database errors
4. Ensure environment variables are properly configured

## Future Enhancements

### Planned Features

1. Social features (friend systems, challenges)
2. Advanced analytics dashboard
3. Notification system for achievements and events
4. Mobile app integration
5. AI-driven personalization

### Performance Optimization

1. Implement caching for leaderboard data
2. Optimize database queries with proper indexing
3. Add pagination for large datasets

## Support

For issues with the gamification features, please contact the development team or refer to the documentation in:
- `src/docs/gamification-README.md`
- `src/docs/gamification-implementation-plan.md`
- `GAMIFICATION_IMPLEMENTATION_SUMMARY.md`