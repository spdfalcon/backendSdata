import express from 'express';
import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
} from '../controllers/chatController';
import { protect, optionalAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(optionalAuth, createChat)
  .get(optionalAuth, getChats);

router.route('/:id')
  .get(optionalAuth, getChatById)
  .put(optionalAuth, updateChat)
  .delete(optionalAuth, deleteChat);

export default router; 