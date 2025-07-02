import express from 'express';
import { loginUser, registerUser, logoutUser } from '../controllers/authController.js';
import { getCurrentUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.post('/logout', logoutUser);

export default router;
