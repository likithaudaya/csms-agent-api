import { Router } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/auth.validator.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', authenticate, authorize('agent'), me);

export default router;