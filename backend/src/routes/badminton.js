import express from 'express';
import * as badmintonController from '../controllers/badmintonController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// ==================== AVAILABILITY ROUTES ====================

// Get all available players
router.get('/players/available', authenticateToken, badmintonController.getAvailablePlayersController);

// Get current user's availability status
router.get('/availability/me', authenticateToken, badmintonController.getMyAvailabilityController);

// Toggle user availability
router.post('/availability/toggle', authenticateToken, badmintonController.toggleAvailabilityController);

// ==================== COURTS ROUTES ====================

// Get all courts
router.get('/courts', authenticateToken, badmintonController.getCourtsController);

// Get available courts at current time
router.get('/courts/available', authenticateToken, badmintonController.getAvailableCourtsController);

// ==================== MATCHES ROUTES ====================

// Create a match
router.post('/matches', authenticateToken, badmintonController.createMatchController);

// Start a match
router.post('/matches/:matchId/start', authenticateToken, badmintonController.startMatchController);

// End a match
router.post('/matches/:matchId/end', authenticateToken, badmintonController.endMatchController);

// Get user's active matches
router.get('/matches/my-matches', authenticateToken, badmintonController.getMyMatchesController);

// Find match - auto-select random available player
router.post('/matches/find', authenticateToken, badmintonController.findMatchController);

export default router;

