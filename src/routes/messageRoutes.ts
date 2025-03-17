import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', optionalAuth, sendMessage);
router.get('/:chatId', optionalAuth, getMessages);

export default router; 