import express from 'express';
import gymController from '../src/../extras/gymController.js';
import { authenticateToken, requireRole } from '../src/middlewares/auth.js';
import { Roles } from '../src/constants/roles.js';

const router = express.Router();

const ADMIN_ONLY = [Roles.ADMIN];

// ==================== PUBLIC GYM ROUTES (Authenticated) ====================

// QR Scan (Check-in / Check-out)
router.post('/scan-qr', authenticateToken, gymController.scanQR);

// Get Workout Categories
router.get('/categories', authenticateToken, gymController.getCategories);

// Get Exercises (can filter by category via query param: ?category=legs)
router.get('/exercises', authenticateToken, gymController.getExercises);

// Get Machine Details
router.get('/machines', authenticateToken, gymController.getMachines);

// Get Rules and Regulations
router.get('/rules', authenticateToken, gymController.getRules);

// Get Realtime User Count
router.get('/count', authenticateToken, gymController.getRealtimeCount);

// ==================== ADMIN ROUTES ====================

// Manage Exercises
router.post('/exercises', authenticateToken, requireRole(ADMIN_ONLY), gymController.addExercise);

// Manage Machines
router.post('/machines', authenticateToken, requireRole(ADMIN_ONLY), gymController.addMachine);

// Manage Rules
router.post('/rules', authenticateToken, requireRole(ADMIN_ONLY), gymController.addRule);

export default router;

