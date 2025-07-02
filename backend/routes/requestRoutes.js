import express from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new request
router.post('/', protect, authorize('user','technician','admin','manager'), createRequest);

// List / filter
router.get('/', protect, getRequests);

// Single request
router.get('/:id', protect, getRequestById);

// Approve or reject
router.put('/:id/approve', protect, authorize('manager','admin','technician'), approveRequest);
router.put('/:id/reject', protect, authorize('manager','admin','technician'), rejectRequest);

export default router;
