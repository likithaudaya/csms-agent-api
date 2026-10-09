import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many login attempts. Try again in 15 minutes'));
  },
});