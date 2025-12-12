import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import * as geminiController from '../controllers/geminiController.js';

const router = express.Router();

/**
 * POST /api/gemini/chat
 * Generate AI response using Gemini
 * Requires authentication
 * Body: { prompt: string, model?: string }
 */
router.post('/chat', authenticateToken, geminiController.chat);

/**
 * POST /api/gemini/chat/history
 * Generate AI response with conversation history
 * Requires authentication
 * Body: { messages: Array<{role: string, content: string}>, model?: string }
 */
router.post('/chat/history', authenticateToken, geminiController.chatWithHistory);

export default router;

