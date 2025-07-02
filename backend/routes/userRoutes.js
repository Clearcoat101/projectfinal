import express from 'express';
import { getCurrentUser, getUsers, updateUserRole } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getCurrentUser);
router.get('/', protect, authorize('admin', 'manager'), getUsers);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);

export default router;