import { Router } from 'express';
import {
  submitContact,
  listContacts,
  exportContacts,
  updateContactStatus,
} from '../controllers/contact.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateContact } from '../middleware/validators.js';
import { contactFormLimiter } from '../middleware/rateLimiter.js';
import { validateEmailDomain } from '../middleware/emailValidator.js';
import { validateRecaptcha } from '../middleware/recaptcha.js';

const router = Router();

router.post(
  '/',
  contactFormLimiter,
  validateRecaptcha,
  validateEmailDomain,
  validateContact,
  submitContact as any
);

router.use(authenticate as any);
router.get('/', listContacts as any);
router.get('/export', requireAdmin as any, exportContacts as any);
router.patch('/:id/status', requireAdmin as any, updateContactStatus as any);

export default router;