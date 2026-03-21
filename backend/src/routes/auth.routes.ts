import { Router } from 'express';
import { googleLogin, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/google', googleLogin);
router.get('/me', authenticate, getMe as any);

export default router;
