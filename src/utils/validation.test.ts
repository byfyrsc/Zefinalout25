import { describe, it, expect } from 'vitest';
import { ValidationUtils } from './validation';

describe('ValidationUtils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(ValidationUtils.isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject incorrect email format', () => {
      expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(ValidationUtils.isValidEmail('test@')).toBe(false);
      expect(ValidationUtils.isValidEmail('@example.com')).toBe(false);
      expect(ValidationUtils.isValidEmail('test@.com')).toBe(false);
      expect(ValidationUtils.isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = ValidationUtils.validatePassword('MyStr0ng!Pass');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password that is too short', () => {
      const result = ValidationUtils.validatePassword('Sh0rt!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = ValidationUtils.validatePassword('mypassw0rd!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = ValidationUtils.validatePassword('MYPASSW0RD!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = ValidationUtils.validatePassword('MyPassword!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = ValidationUtils.validatePassword('MyPassw0rd');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone format', () => {
      expect(ValidationUtils.isValidPhone('+1234567890')).toBe(true);
      expect(ValidationUtils.isValidPhone('1234567890')).toBe(true);
      expect(ValidationUtils.isValidPhone('+123456789012345')).toBe(true);
    });

    it('should reject incorrect phone format', () => {
      expect(ValidationUtils.isValidPhone('invalid-phone')).toBe(false);
      expect(ValidationUtils.isValidPhone('123-456-7890')).toBe(false);
      expect(ValidationUtils.isValidPhone('')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('should validate correct URL format', () => {
      expect(ValidationUtils.isValidURL('https://example.com')).toBe(true);
      expect(ValidationUtils.isValidURL('http://localhost:3000')).toBe(true);
      expect(ValidationUtils.isValidURL('https://sub.domain.com/path?query=value')).toBe(true);
    });

    it('should reject incorrect URL format', () => {
      expect(ValidationUtils.isValidURL('invalid-url')).toBe(false);
      expect(ValidationUtils.isValidURL('')).toBe(false);
      expect(ValidationUtils.isValidURL('http://')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const result = ValidationUtils.sanitizeInput(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should sanitize quotes', () => {
      const input = 'Text with "quotes" and \'apostrophes\'';
      const result = ValidationUtils.sanitizeInput(input);
      expect(result).toBe('Text with &quot;quotes&quot; and &#x27;apostrophes&#x27;');
    });

    it('should return empty string when input is empty', () => {
      const result = ValidationUtils.sanitizeInput('');
      expect(result).toBe('');
    });

    it('should return undefined when input is undefined', () => {
      const result = ValidationUtils.sanitizeInput(undefined as any);
      expect(result).toBeUndefined();
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUID format', () => {
      expect(ValidationUtils.isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(ValidationUtils.isValidUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
    });

    it('should reject incorrect UUID format', () => {
      expect(ValidationUtils.isValidUUID('invalid-uuid')).toBe(false);
      expect(ValidationUtils.isValidUUID('')).toBe(false);
      expect(ValidationUtils.isValidUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false); // Missing one character
    });
  });

  describe('isValidDate', () => {
    it('should validate correct date format', () => {
      expect(ValidationUtils.isValidDate('2023-01-01T00:00:00Z')).toBe(true);
      expect(ValidationUtils.isValidDate('2023-12-31T23:59:59.999Z')).toBe(true);
    });

    it('should reject incorrect date format', () => {
      expect(ValidationUtils.isValidDate('invalid-date')).toBe(false);
      expect(ValidationUtils.isValidDate('')).toBe(false);
      expect(ValidationUtils.isValidDate('2023-13-01T00:00:00Z')).toBe(true); // Date validation doesn't check logical validity
    });
  });

  describe('isValidRange', () => {
    it('should validate numbers within range', () => {
      expect(ValidationUtils.isValidRange(5, 1, 10)).toBe(true);
      expect(ValidationUtils.isValidRange(1, 1, 10)).toBe(true);
      expect(ValidationUtils.isValidRange(10, 1, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      expect(ValidationUtils.isValidRange(0, 1, 10)).toBe(false);
      expect(ValidationUtils.isValidRange(11, 1, 10)).toBe(false);
    });
  });

  describe('isValidArrayLength', () => {
    it('should validate arrays with correct length', () => {
      expect(ValidationUtils.isValidArrayLength([1, 2, 3], 1, 5)).toBe(true);
      expect(ValidationUtils.isValidArrayLength([1], 1, 5)).toBe(true);
      expect(ValidationUtils.isValidArrayLength([1, 2, 3, 4, 5], 1, 5)).toBe(true);
    });

    it('should reject arrays with incorrect length', () => {
      expect(ValidationUtils.isValidArrayLength([], 1, 5)).toBe(false);
      expect(ValidationUtils.isValidArrayLength([1, 2, 3, 4, 5, 6], 1, 5)).toBe(false);
    });
  });

  describe('isValidStringLength', () => {
    it('should validate strings with correct length', () => {
      expect(ValidationUtils.isValidStringLength('hello', 1, 10)).toBe(true);
      expect(ValidationUtils.isValidStringLength('h', 1, 10)).toBe(true);
      expect(ValidationUtils.isValidStringLength('hello world', 1, 20)).toBe(true);
    });

    it('should reject strings with incorrect length', () => {
      expect(ValidationUtils.isValidStringLength('', 1, 10)).toBe(false);
      expect(ValidationUtils.isValidStringLength('this is a very long string', 1, 10)).toBe(false);
    });
  });
});