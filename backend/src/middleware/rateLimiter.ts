import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});

export const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { status: 'error', message: 'Submission limit reached. Try again in 1 hour.' },
});
