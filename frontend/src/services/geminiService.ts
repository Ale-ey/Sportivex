import axiosInstance from '@/lib/axiosInstance';

// ==================== TYPES ====================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  prompt: string;
  model?: string;
  useContext?: boolean;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    model: string;
    usedContext?: boolean;
  };
}

export interface ChatWithHistoryRequest {
  messages: ChatMessage[];
  model?: string;
}

export interface ChatWithHistoryResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    model: string;
  };
}

// ==================== SERVICE ====================

export const geminiService = {
  /**
   * Generate AI response using Gemini with optional database context
   * @param prompt - The user's prompt/question
   * @param model - Optional model name (default: "gemini-2.5-flash")
   * @param useContext - Whether to use database context (default: true)
   */
  chat: async (
    prompt: string,
    model?: string,
    useContext: boolean = true
  ): Promise<ChatResponse> => {
    const response = await axiosInstance.post<ChatResponse>('/gemini/chat', {
      prompt,
      model,
      useContext,
    });
    return response.data;
  },

  /**
   * Generate AI response with conversation history
   * @param messages - Array of conversation messages with role and content
   * @param model - Optional model name (default: "gemini-2.5-flash")
   */
  chatWithHistory: async (
    messages: ChatMessage[],
    model?: string
  ): Promise<ChatWithHistoryResponse> => {
    const response = await axiosInstance.post<ChatWithHistoryResponse>(
      '/gemini/chat/history',
      {
        messages,
        model,
      }
    );
    return response.data;
  },
};

