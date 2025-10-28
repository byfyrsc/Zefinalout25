export const PLAN_LIMITS = {
  starter: {
    max_locations: 1,
    max_feedbacks_per_month: 500,
    max_campaigns_per_month: 10,
    max_users: 5,
    max_events: 3,
    api_calls_per_hour: 1000,
    storage_gb: 1,
  },
  professional: {
    max_locations: 5,
    max_feedbacks_per_month: 2500,
    max_campaigns_per_month: 50,
    max_users: 25,
    max_events: 15,
    api_calls_per_hour: 10000,
    storage_gb: 10,
  },
  enterprise: {
    max_locations: Infinity,
    max_feedbacks_per_month: Infinity,
    max_campaigns_per_month: Infinity,
    max_users: Infinity,
    max_events: Infinity,
    api_calls_per_hour: -1, // Custom
    storage_gb: -1, // Custom
  },
};
