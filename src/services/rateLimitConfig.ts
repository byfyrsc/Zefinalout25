// Rate limiting configuration with role-based granular limits
import { UserRole } from '@/types/database';

// Rate limiting configuration by user role
export const ROLE_BASED_RATE_LIMITS = {
  // Anonymous users (not logged in)
  anonymous: {
    authAttempts: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    generalRequests: {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    },
    apiRequests: {
      maxRequests: 50,
      windowMs: 60 * 1000, // 1 minute
    }
  },
  
  // Viewer role - read-only access
  viewer: {
    authAttempts: {
      maxAttempts: 10,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    generalRequests: {
      maxRequests: 200,
      windowMs: 60 * 1000, // 1 minute
    },
    apiRequests: {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    }
  },
  
  // Staff role - standard user access
  staff: {
    authAttempts: {
      maxAttempts: 10,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    generalRequests: {
      maxRequests: 300,
      windowMs: 60 * 1000, // 1 minute
    },
    apiRequests: {
      maxRequests: 150,
      windowMs: 60 * 1000, // 1 minute
    }
  },
  
  // Manager role - elevated access
  manager: {
    authAttempts: {
      maxAttempts: 15,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    generalRequests: {
      maxRequests: 500,
      windowMs: 60 * 1000, // 1 minute
    },
    apiRequests: {
      maxRequests: 250,
      windowMs: 60 * 1000, // 1 minute
    }
  },
  
  // Admin role - administrative access
  admin: {
    authAttempts: {
      maxAttempts: 20,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    generalRequests: {
      maxRequests: 1000,
      windowMs: 60 * 1000, // 1 minute
    },
    apiRequests: {
      maxRequests: 500,
      windowMs: 60 * 1000, // 1 minute
    }
  },
  
  // Owner role - highest privileges
  owner: {
    authAttempts: {
      maxAttempts: 30,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    generalRequests: {
      maxRequests: 2000,
      windowMs: 60 * 1000, // 1 minute
    },
    apiRequests: {
      maxRequests: 1000,
      windowMs: 60 * 1000, // 1 minute
    }
  }
};

// API endpoint specific rate limits
export const API_ENDPOINT_RATE_LIMITS = {
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  auth: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  feedback: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
  },
  billing: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  analytics: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
  }
};

// Get rate limit config for a specific role
export function getRateLimitConfigForRole(role: UserRole | 'anonymous') {
  return ROLE_BASED_RATE_LIMITS[role] || ROLE_BASED_RATE_LIMITS.anonymous;
}

// Get API endpoint rate limit config
export function getApiEndpointRateLimit(endpoint: string) {
  if (endpoint.includes('/auth')) {
    return API_ENDPOINT_RATE_LIMITS.auth;
  } else if (endpoint.includes('/feedback')) {
    return API_ENDPOINT_RATE_LIMITS.feedback;
  } else if (endpoint.includes('/billing')) {
    return API_ENDPOINT_RATE_LIMITS.billing;
  } else if (endpoint.includes('/analytics')) {
    return API_ENDPOINT_RATE_LIMITS.analytics;
  }
  return API_ENDPOINT_RATE_LIMITS.general;
}