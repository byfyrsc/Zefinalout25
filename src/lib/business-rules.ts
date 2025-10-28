
export type Plan = 'starter' | 'professional' | 'enterprise' | 'enterprise_plus';

export interface TenantUsage {
  locations: number;
  feedbacks_this_month: number;
  campaigns_this_month: number;
  total_users: number;
  events: number;
}

export interface Tenant {
  id: string;
  plan_id: Plan;
  current_usage: TenantUsage;
}

export const PLAN_LIMITS = {
  starter: {
    max_locations: 1,
    max_feedbacks_per_month: 500,
    max_campaigns_per_month: 10,
    max_users: 5,
    max_events: 3,
  },
  professional: {
    max_locations: 5,
    max_feedbacks_per_month: 2500,
    max_campaigns_per_month: 50,
    max_users: 25,
    max_events: 15,
  },
  enterprise: {
    max_locations: Infinity,
    max_feedbacks_per_month: Infinity,
    max_campaigns_per_month: Infinity,
    max_users: Infinity,
    max_events: Infinity,
  },
  enterprise_plus: {
    max_locations: Infinity,
    max_feedbacks_per_month: Infinity,
    max_campaigns_per_month: Infinity,
    max_users: Infinity,
    max_events: Infinity,
  },
};

export type Resource = 'location' | 'feedback' | 'campaign' | 'user' | 'event';

export function validatePlanLimits(tenant: Tenant, resource: Resource): boolean {
  const usage = tenant.current_usage;
  const limits = PLAN_LIMITS[tenant.plan_id];

  if (!limits) {
    return false;
  }

  switch(resource) {
    case 'location':
      return usage.locations < limits.max_locations;
    case 'feedback':
      return usage.feedbacks_this_month < limits.max_feedbacks_per_month;
    case 'campaign':
      return usage.campaigns_this_month < limits.max_campaigns_per_month;
    case 'user':
      return usage.total_users < limits.max_users;
    case 'event':
      return usage.events < limits.max_events;
    default:
      return false;
  }
}
