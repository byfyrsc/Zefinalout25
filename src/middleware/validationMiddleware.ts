import { SecurityService } from '@/services/securityService';

// Middleware to sanitize request body
export const sanitizeBody = (req: any, res: any, next: any) => {
  if (req.body) {
    req.sanitizedBody = SecurityService.sanitizeInput(JSON.stringify(req.body));
    try {
      req.sanitizedBody = JSON.parse(req.sanitizedBody);
    } catch (error) {
      // If parsing fails, use the original body
      req.sanitizedBody = req.body;
    }
  }
  next();
};

// Middleware to sanitize request query parameters
export const sanitizeQuery = (req: any, res: any, next: any) => {
  if (req.query) {
    const sanitizedQuery: any = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        sanitizedQuery[key] = SecurityService.sanitizeInput(value);
      } else {
        sanitizedQuery[key] = value;
      }
    }
    req.sanitizedQuery = sanitizedQuery;
  }
  next();
};

// Middleware to sanitize request parameters
export const sanitizeParams = (req: any, res: any, next: any) => {
  if (req.params) {
    const sanitizedParams: any = {};
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === 'string') {
        sanitizedParams[key] = SecurityService.sanitizeInput(value);
      } else {
        sanitizedParams[key] = value;
      }
    }
    req.sanitizedParams = sanitizedParams;
  }
  next();
};

// Validation middleware for email format
export const validateEmailFormat = (req: any, res: any, next: any) => {
  const { email } = req.body;
  if (email && !SecurityService.validateEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }
  next();
};

// Validation middleware for password strength
export const validatePasswordStrength = (req: any, res: any, next: any) => {
  const { password } = req.body;
  if (password) {
    const validation = SecurityService.validatePassword(password);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        details: validation.errors
      });
    }
  }
  next();
};

// Combined sanitization middleware
export const sanitizeAll = [
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams
];

// Combined validation middleware
export const validateAll = [
  validateEmailFormat,
  validatePasswordStrength
];