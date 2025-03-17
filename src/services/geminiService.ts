import axios from 'axios';
import { ApiError } from '../middleware/errorHandler';

// Fixed context to be sent with every request
const FIXED_CONTEXT = `
شما یک دستیار هوش مصنوعی شرکت شریف دیتا (Sdata) هستید.
شما باید به سوالات کاربران به زبان فارسی پاسخ دهید.
پاسخ‌های شما باید دقیق، مفید و مودبانه باشد.
شما نباید اطلاعات نادرست یا گمراه‌کننده ارائه دهید.
اگر پاسخ سوالی را نمی‌دانید، باید صادقانه بگویید که نمی‌دانید.
`;

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export const generateAIResponse = async (
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; content: string }[] = []
): Promise<string> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, 'کلید API هوش مصنوعی تنظیم نشده است');
    }

    // Prepare the messages with fixed context
    const messages = [
      {
        role: 'user' as const,
        content: FIXED_CONTEXT,
      },
      ...chatHistory,
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    // Format messages for Gemini API
    const contents = messages.map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));

    const response = await axios.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (
      !response.data.candidates ||
      response.data.candidates.length === 0 ||
      !response.data.candidates[0].content ||
      !response.data.candidates[0].content.parts ||
      response.data.candidates[0].content.parts.length === 0
    ) {
      throw new ApiError(500, 'پاسخی از هوش مصنوعی دریافت نشد');
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'خطا در ارتباط با سرویس هوش مصنوعی');
  }
};

export const generateChatTitle = async (aiResponse: string): Promise<string> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, 'کلید API هوش مصنوعی تنظیم نشده است');
    }

    const prompt = `این پیام را فقط در سه کلمه خلاصه کن و فقط همان سه کلمه را برگردان، بدون هیچ توضیح اضافی:\n${aiResponse}`;

    const response = await axios.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (
      !response.data.candidates ||
      response.data.candidates.length === 0 ||
      !response.data.candidates[0].content ||
      !response.data.candidates[0].content.parts ||
      response.data.candidates[0].content.parts.length === 0
    ) {
      throw new ApiError(500, 'عنوان چت دریافت نشد');
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'خطا در دریافت عنوان چت');
  }
}; 