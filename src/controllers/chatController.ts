import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { ApiError, asyncHandler } from '../middleware/errorHandler';

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private/Public
export const createChat = asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.body;
  const userId = req.user?._id;
  const guestId = req.body.guestId;

  if (!userId && !guestId) {
    throw new ApiError(400, 'شناسه کاربر یا مهمان الزامی است');
  }

  const chatData: any = {
    title: title || 'گفتگوی جدید',
  };

  if (userId) {
    chatData.user = userId;
  } else {
    chatData.guestId = guestId;
  }

  const chat = await Chat.create(chatData);

  res.status(201).json(chat);
});

// @desc    Get all chats for a user or guest
// @route   GET /api/chats
// @access  Private/Public
export const getChats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const guestId = req.query.guestId as string;

  if (!userId && !guestId) {
    throw new ApiError(400, 'شناسه کاربر یا مهمان الزامی است');
  }

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  const chats = await Chat.find(query).sort({ updatedAt: -1 });

  res.json(chats);
});

// @desc    Get a single chat
// @route   GET /api/chats/:id
// @access  Private/Public
export const getChatById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const guestId = req.query.guestId as string;
  const chatId = req.params.id;

  let query: any = { _id: chatId };
  if (userId) {
    query.user = userId;
  } else if (guestId) {
    query.guestId = guestId;
  } else {
    throw new ApiError(400, 'شناسه کاربر یا مهمان الزامی است');
  }

  const chat = await Chat.findOne(query);

  if (!chat) {
    throw new ApiError(404, 'چت یافت نشد');
  }

  res.json(chat);
});

// @desc    Update a chat
// @route   PUT /api/chats/:id
// @access  Private/Public
export const updateChat = asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.body;
  const userId = req.user?._id;
  const guestId = req.body.guestId;
  const chatId = req.params.id;

  let query: any = { _id: chatId };
  if (userId) {
    query.user = userId;
  } else if (guestId) {
    query.guestId = guestId;
  } else {
    throw new ApiError(400, 'شناسه کاربر یا مهمان الزامی است');
  }

  const chat = await Chat.findOne(query);

  if (!chat) {
    throw new ApiError(404, 'چت یافت نشد');
  }

  chat.title = title || chat.title;
  await chat.save();

  res.json(chat);
});

// @desc    Delete a chat
// @route   DELETE /api/chats/:id
// @access  Private/Public
export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const guestId = req.query.guestId as string;
  const chatId = req.params.id;

  let query: any = { _id: chatId };
  if (userId) {
    query.user = userId;
  } else if (guestId) {
    query.guestId = guestId;
  } else {
    throw new ApiError(400, 'شناسه کاربر یا مهمان الزامی است');
  }

  const chat = await Chat.findOne(query);

  if (!chat) {
    throw new ApiError(404, 'چت یافت نشد');
  }

  // Delete all messages in the chat
  await Message.deleteMany({ chat: chatId });

  // Delete the chat
  await chat.deleteOne();

  res.json({ message: 'چت با موفقیت حذف شد' });
}); 