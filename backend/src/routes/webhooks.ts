import { Router } from 'express';
import { handleProductionUpdate, handleStripeWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/production-update', handleProductionUpdate);
router.post('/stripe', handleStripeWebhook);

export default router;
