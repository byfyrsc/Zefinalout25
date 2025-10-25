// Middleware to set security headers
export const securityHeaders = (req: any, res: any, next: any) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "media-src 'self'; " +
    "object-src 'none'; " +
    "child-src 'none';"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature Policy (Permissions Policy)
  res.setHeader('Permissions-Policy', 
    "geolocation=(), " +
    "microphone=(), " +
    "camera=(), " +
    "payment=(), " +
    "usb=()"
  );
  
  next();
};

// Middleware to remove powered by header
export const hidePoweredBy = (req: any, res: any, next: any) => {
  res.removeHeader('X-Powered-By');
  next();
};