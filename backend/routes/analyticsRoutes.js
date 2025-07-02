import express from 'express';
import { getRequestStats } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/requests', protect, authorize('manager', 'admin'), getRequestStats);

export default router;
