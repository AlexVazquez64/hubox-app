import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

const DISPOSABLE_DOMAINS = [
    'mailinator.com', 'tempmail.com', 'guerrillamail.com',
    'throwaway.email', 'fakeinbox.com', 'sharklasers.com',
    'yopmail.com', 'trashmail.com', 'maildrop.cc',
    'dispostable.com', 'spamgourmet.com', 'tempr.email',
];

const extractDomain = (email: string): string =>
    email.split('@')[1]?.toLowerCase() ?? '';

export const validateEmailDomain = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const email = req.body?.email as string;
    if (!email) return next(new AppError('Email is required', 400));

    const domain = extractDomain(email);
    if (!domain) return next(new AppError('Invalid email format', 400));

    if (DISPOSABLE_DOMAINS.includes(domain)) {
        return next(new AppError('Disposable email addresses are not allowed', 400));
    }

    next();
};