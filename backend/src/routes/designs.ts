import { Router } from 'express';
import {
  saveDesign,
  getDesigns,
  getDesign,
  updateDesign,
  deleteDesign
} from '../controllers/designController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All design routes require authentication
router.use(authenticate);

router.post('/', saveDesign);
router.get('/', getDesigns);
router.get('/:id', getDesign);
router.put('/:id', updateDesign);
router.delete('/:id', deleteDesign);

export default router;
