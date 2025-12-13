import { generateContent, generateContentWithHistory, generateIntelligentResponse } from '../services/geminiService.js';

/**
 * Generate intelligent AI response using Gemini with database context
 * POST /api/gemini/chat
 * Body: { prompt: string, model?: string, useContext?: boolean }
 */
export const chat = async (req, res) => {
  try {
    const { prompt, model, useContext = true } = req.body;
    const user = req.user; // Get authenticated user

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    // Use intelligent response with database context by default
    const result = useContext 
      ? await generateIntelligentResponse(prompt, model, user)
      : await generateContent(prompt, model);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || "Failed to generate response"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Response generated successfully",
      data: {
        response: result.text,
        model: model || "gemini-2.5-flash",
        usedContext: useContext
      }
    });
  } catch (error) {
    console.error("Error in chat controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Generate AI response with conversation history
 * POST /api/gemini/chat/history
 * Body: { messages: Array<{role: string, content: string}>, model?: string }
 */
export const chatWithHistory = async (req, res) => {
  try {
    const { messages, model } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Messages array is required and must not be empty"
      });
    }

    // Validate message structure
    const invalidMessages = messages.filter(
      msg => !msg.content || typeof msg.content !== "string" || msg.content.trim().length === 0
    );

    if (invalidMessages.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All messages must have a non-empty content string"
      });
    }

    const user = req.user; // Get authenticated user
    const result = await generateContentWithHistory(messages, model, user);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || "Failed to generate response"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Response generated successfully",
      data: {
        response: result.text,
        model: model || "gemini-2.5-flash"
      }
    });
  } catch (error) {
    console.error("Error in chatWithHistory controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

