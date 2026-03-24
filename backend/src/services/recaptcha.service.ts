import axios from 'axios';
import { AppError } from '../middleware/errorHandler.js';

const RECAPTCHA_THRESHOLD = 0.3;

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

    console.log('reCAPTCHA result:', JSON.stringify(data));

    if (!data.success) {
        console.error('reCAPTCHA errors:', data['error-codes']);
        throw new AppError('reCAPTCHA verification failed. Please try again.', 400);
    }

    if (data.score < RECAPTCHA_THRESHOLD) {
        console.error('reCAPTCHA score too low:', data.score);
        throw new AppError('reCAPTCHA score too low. Please try again.', 400);
    }
};