import express from 'express';
import { 
  getResources, 
  createResource, 
  updateResourceStock,
  checkAvailability 
} from '../controllers/resourceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getResources);
router.post('/', protect, authorize('admin', 'manager'), createResource);
router.put('/:id/stock', protect, authorize('admin', 'technician'), updateResourceStock);
router.get('/check-availability', protect, checkAvailability);

export default router;