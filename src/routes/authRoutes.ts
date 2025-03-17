import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  generateGuestId,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/guest', generateGuestId);

export default router; 