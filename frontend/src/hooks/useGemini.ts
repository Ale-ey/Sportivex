import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import {
  geminiService,
  type ChatMessage,
  type ChatResponse,
  type ChatWithHistoryResponse,
} from '@/services/geminiService';

/**
 * Custom hook for Gemini chatbot operations
 * Provides clean interface for AI chat functionality with state management
 */
export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /**
   * Send a chat message (simple prompt without history)
   * @param prompt - The user's prompt/question
   * @param model - Optional model name
   * @param useContext - Whether to use database context (default: true)
   */
  const sendMessage = useCallback(
    async (
      prompt: string,
      model?: string,
      useContext: boolean = true
    ): Promise<{ success: boolean; response?: string; error?: string }> => {
      if (!prompt.trim()) {
        const errorMsg = 'Please enter a message';
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await geminiService.chat(prompt, model, useContext);

        if (response.success) {
          // Add user message and assistant response to history
          const newMessages: ChatMessage[] = [
            { role: 'user', content: prompt },
            { role: 'assistant', content: response.data.response },
          ];
          setMessages((prev) => [...prev, ...newMessages]);

          return {
            success: true,
            response: response.data.response,
          };
        } else {
          throw new Error(response.message || 'Failed to get response');
        }
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.message ||
              err.response?.data?.error ||
              err.message
            : err instanceof Error
            ? err.message
            : 'Failed to send message';

        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Send a chat message with conversation history
   * @param userMessage - The user's message
   * @param model - Optional model name
   */
  const sendMessageWithHistory = useCallback(
    async (
      userMessage: string,
      model?: string
    ): Promise<{ success: boolean; response?: string; error?: string }> => {
      if (!userMessage.trim()) {
        const errorMsg = 'Please enter a message';
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }

      setLoading(true);
      setError(null);

      try {
        // Add user message to history first
        const updatedMessages: ChatMessage[] = [
          ...messages,
          { role: 'user', content: userMessage },
        ];
        setMessages(updatedMessages);

        // Send request with full conversation history
        const response = await geminiService.chatWithHistory(
          updatedMessages,
          model
        );

        if (response.success) {
          // Add assistant response to history
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.data.response,
          };
          setMessages((prev) => [...prev, assistantMessage]);

          return {
            success: true,
            response: response.data.response,
          };
        } else {
          // Remove the user message if request failed
          setMessages(messages);
          throw new Error(response.message || 'Failed to get response');
        }
      } catch (err) {
        // Remove the user message if request failed
        setMessages(messages);

        const errorMessage =
          err instanceof AxiosError
            ? err.response?.data?.message ||
              err.response?.data?.error ||
              err.message
            : err instanceof Error
            ? err.message
            : 'Failed to send message';

        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Add a message to the conversation history manually
   */
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Set the conversation history
   */
  const setHistory = useCallback((history: ChatMessage[]) => {
    setMessages(history);
  }, []);

  return {
    // State
    loading,
    error,
    messages,

    // Actions
    sendMessage,
    sendMessageWithHistory,
    clearHistory,
    addMessage,
    setHistory,
  };
};

