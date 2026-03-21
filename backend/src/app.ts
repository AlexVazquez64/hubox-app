import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contact.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

app.use(globalErrorHandler as any);

export default app;
