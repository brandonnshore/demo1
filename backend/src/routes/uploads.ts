import { Router } from 'express';
import { getSignedUrl, uploadFile, uploadMiddleware } from '../controllers/uploadController';

const router = Router();

router.post('/signed-url', getSignedUrl);
router.post('/file', uploadMiddleware, uploadFile);

export default router;
