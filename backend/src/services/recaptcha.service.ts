import axios from 'axios';
import { AppError } from '../middleware/errorHandler.js';

const RECAPTCHA_THRESHOLD = 0.5;

interface RecaptchaResponse {
    success: boolean;
    score: number;
    action: string;
    'error-codes'?: string[];
}

export const verifyRecaptcha = async (token: string): Promise<void> => {
    const { data } = await axios.post<RecaptchaResponse>(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token,
            },
        }
    );

    if (!data.success || data.score < RECAPTCHA_THRESHOLD) {
        throw new AppError('reCAPTCHA verification failed. Please try again.', 400);
    }
};