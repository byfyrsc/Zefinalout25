import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SecurityService } from '@/services/securityService';

export const useSecurity = () => {
  const { isRateLimited, isSessionExpiringSoon, extendSession } = useAuth();
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Check if session is expiring soon
  useEffect(() => {
    const checkSessionExpiration = async () => {
      const expiringSoon = await isSessionExpiringSoon();
      setIsExpiringSoon(expiringSoon);
      
      if (expiringSoon && !showSessionWarning) {
        setShowSessionWarning(true);
      }
    };

    // Check immediately
    checkSessionExpiration();

    // Check every minute
    const interval = setInterval(checkSessionExpiration, 60000);

    return () => clearInterval(interval);
  }, [isSessionExpiringSoon, showSessionWarning]);

  // Reset session warning when it's dismissed
  const dismissSessionWarning = () => {
    setShowSessionWarning(false);
  };

  // Extend session
  const handleExtendSession = async () => {
    const success = await extendSession();
    if (success) {
      setShowSessionWarning(false);
    }
    return success;
  };

  // Sanitize user input
  const sanitizeInput = (input: string): string => {
    return SecurityService.sanitizeInput(input);
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    return SecurityService.validateEmail(email);
  };

  // Validate password strength
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    return SecurityService.validatePassword(password);
  };

  return {
    // Rate limiting
    isRateLimited: isRateLimited(),
    
    // Session management
    isSessionExpiringSoon: isExpiringSoon,
    showSessionWarning,
    dismissSessionWarning,
    extendSession: handleExtendSession,
    
    // Input validation
    sanitizeInput,
    validateEmail,
    validatePassword
  };
};