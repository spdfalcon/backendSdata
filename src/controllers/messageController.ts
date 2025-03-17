import { Request, Response } from 'express';
import Message from '../models/Message';
import Chat from '../models/Chat';
import User from '../models/User';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { generateAIResponse, generateChatTitle } from '../services/geminiService';

// @desc    Send a message and get AI response
// @route   POST /api/messages
// @access  Private/Public
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, chatId } = req.body;
  const userId = req.user?._id;
  const guestId = req.body.guestId;

  if (!content || !chatId) {
    throw new ApiError(400, 'محتوای پیام و شناسه چت الزامی است');
  }

  if (!userId && !guestId) {
    throw new ApiError(400, 'شناسه کاربر یا مهمان الزامی است');
  }

  // Check if chat exists
  let chatQuery: any = { _id: chatId };
  if (userId) {
    chatQuery.user = userId;
  } else {
    chatQuery.guestId = guestId;
  }

  const chat = await Chat.findOne(chatQuery);
  if (!chat) {
    throw new ApiError(404, 'چت یافت نشد');
  }

  // Check message limit for guests
  if (!userId) {
    const messageCount = await Message.countDocuments({
      chat: chatId,
      guestId,
      isAI: false,
    });

    if (messageCount >= 50) {
      throw new ApiError(
        403,
        'محدودیت پیام برای کاربران مهمان: لطفاً ثبت نام کنید'
      );
    }
  }

  // Create user message
  const messageData: any = {
    content,
    chat: chatId,
    isAI: false,
  };

  if (userId) {
    messageData.user = userId;
  } else {
    messageData.guestId = guestId;
  }

  const userMessage = await Message.create(messageData);

  // Get chat history for context
  const chatHistory = await Message.find({ chat: chatId })
    .sort({ createdAt: 1 })
    .limit(10);

  const formattedHistory = chatHistory.map((msg) => ({
    role: msg.isAI ? 'model' : 'user',
    content: msg.content,
  }));

  // Generate AI response
  const aiResponse = await generateAIResponse(content, formattedHistory);

  // Check if this is the first AI message in the chat
  const aiMessagesCount = await Message.countDocuments({
    chat: chatId,
    isAI: true,
  });

  let chatTitle = null;
  if (aiMessagesCount === 0) {
    // Generate a title from the AI response
    chatTitle = await generateChatTitle(aiResponse);
    // Update the chat title
    await Chat.findByIdAndUpdate(chatId, { title: chatTitle });
  }

  // Create AI message
  const aiMessageData = {
    content: aiResponse,
    chat: chatId,
    isAI: true,
  };

  if (userId) {
    aiMessageData.user = userId;
    // Increment message count for registered users
    await User.findByIdAndUpdate(userId, { $inc: { messageCount: 1 } });
  } else {
    aiMessageData.guestId = guestId;
  }

  const aiMessage = await Message.create(aiMessageData);

  res.status(201).json({
    userMessage,
    aiMessage,
    chatTitle, // Include the new title in the response if generated
  });
});

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private/Public
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const chatId = req.params.chatId;
  const userId = req.user?._id;
  const guestId = req.query.guestId as string;

  if (!userId && !guestId) {
    throw new ApiError(400, 'شناسه کاربر یا مهمان الزامی است');
  }

  // Check if chat exists and belongs to user/guest
  let chatQuery: any = { _id: chatId };
  if (userId) {
    chatQuery.user = userId;
  } else {
    chatQuery.guestId = guestId;
  }

  const chat = await Chat.findOne(chatQuery);
  if (!chat) {
    throw new ApiError(404, 'چت یافت نشد');
  }

  // Get messages
  const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });

  res.json(messages);
}); 