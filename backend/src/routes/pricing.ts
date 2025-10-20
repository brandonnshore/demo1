import { Router } from 'express';
import { calculateQuote } from '../controllers/priceController';

const router = Router();

router.post('/quote', calculateQuote);

export default router;
