import express from 'express';
import authController from "../controllers/authController.js";
import { authenticateSupabase } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authenticateSupabase, authController.logout);
router.get('/profile', authenticateSupabase, authController.getProfile);
router.put('/profile', authenticateSupabase, authController.updateProfile);

export default router;
