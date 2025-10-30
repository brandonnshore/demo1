import { Router } from 'express';
import { login, register, me, oauthSync } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/oauth/sync', oauthSync);
router.get('/me', authenticate, me);

export default router;
