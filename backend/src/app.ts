import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contact.routes.js';

const app = express();
app.set('trust proxy', 1);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://accounts.google.com',
                    'https://apis.google.com',
                    'https://www.gstatic.com',
                    'https://www.google.com',
                    'https://www.recaptcha.net',
                ],
                frameSrc: [
                    "'self'",
                    'https://accounts.google.com',
                    'https://www.google.com',
                    'https://www.recaptcha.net',
                ],
                connectSrc: [
                    "'self'",
                    'https://accounts.google.com',
                    'https://www.googleapis.com',
                    'https://www.google.com',
                    'https://recaptcha.google.com',
                ],
                imgSrc: ["'self'", 'data:', 'https:'],
                workerSrc: ["'self'", 'blob:'],
            },
        },
        crossOriginOpenerPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

app.use(globalErrorHandler as any);

export default app;