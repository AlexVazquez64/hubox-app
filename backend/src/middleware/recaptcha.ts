import { Request, Response, NextFunction } from 'express';
import { verifyRecaptcha } from '../services/recaptcha.service.js';
import { AppError } from './errorHandler.js';

export const validateRecaptcha = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.body?.recaptchaToken as string;
    if (!token) return next(new AppError('reCAPTCHA token is required', 400));

    try {
        await verifyRecaptcha(token);
        next();
    } catch (err) {
        next(err);
    }
};