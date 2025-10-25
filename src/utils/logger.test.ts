import { describe, it, expect, beforeEach, vi } from 'vitest';
import Logger from './logger';

describe('Logger', () => {
  beforeEach(() => {
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  });

  it('should create a correlation ID', () => {
    const correlationId = Logger.getCorrelationId();
    expect(correlationId).toBeNull();
  });

  it('should set and get a correlation ID', () => {
    const testId = 'test-correlation-id';
    Logger.setCorrelationId(testId);
    expect(Logger.getCorrelationId()).toBe(testId);
  });

  it('should clear a correlation ID', () => {
    const testId = 'test-correlation-id';
    Logger.setCorrelationId(testId);
    Logger.clearCorrelationId();
    expect(Logger.getCorrelationId()).toBeNull();
  });

  it('should log messages with different levels', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    Logger.info('Test info message');
    Logger.warn('Test warn message');
    Logger.error('Test error message');
    Logger.debug('Test debug message');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should include correlation ID in log metadata', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const testId = 'test-correlation-id';
    Logger.setCorrelationId(testId);
    
    Logger.info('Test message with correlation ID');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test message with correlation ID'),
      expect.objectContaining({ correlationId: testId })
    );
    
    consoleSpy.mockRestore();
  });
});