import { Router } from 'express';
import { createOrder, capturePayment, getOrder } from '../controllers/orderController';

const router = Router();

router.post('/create', createOrder);
router.post('/:id/capture-payment', capturePayment);
router.get('/:id', getOrder);

export default router;
