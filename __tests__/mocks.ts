// @ts-nocheck
import pino from 'pino';
import rateLimit from 'express-rate-limit';

// Mock implementations for testing
export const mockLogger = pino({ level: 'silent' });

export const mockRequest = (overrides = {}) => ({
  headers: {},
  body: {},
  ip: '127.0.0.1',
  method: 'POST',
  path: '/api/execute',
  ...overrides
} as any);

export const mockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    statusCode: 200
  };
  return res;
};

export const mockNext = jest.fn();
