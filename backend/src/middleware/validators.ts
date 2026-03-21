import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export const validateContact = [
  body('fullName').trim().notEmpty().isLength({ min: 2, max: 150 }),
  body('email').trim().normalizeEmail().isEmail(),
  body('phone').optional().trim().isMobilePhone('any'),
  body('company').optional().trim().isLength({ max: 150 }),
  body('message').trim().notEmpty().isLength({ min: 10, max: 5000 }),
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(JSON.stringify(errors.array()), 422));
    }
    next();
  },
];
