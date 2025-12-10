import express from 'express';
import * as leagueController from '../controllers/leagueController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { Roles } from '../constants/roles.js';

const router = express.Router();

const ADMIN_ONLY = [Roles.ADMIN];
const ADMIN_OR_FACULTY = [Roles.ADMIN, Roles.FACULTY];

// ==================== LEAGUE ROUTES ====================

// Get all leagues (all authenticated users)
router.get('/', authenticateToken, leagueController.getLeaguesController);

// Get league by ID (all authenticated users)
router.get('/:id', authenticateToken, leagueController.getLeagueByIdController);

// Create league (admin/faculty only)
router.post(
  '/',
  authenticateToken,
  requireRole(ADMIN_OR_FACULTY),
  leagueController.createLeagueController
);

// Update league (admin/faculty only)
router.put(
  '/:id',
  authenticateToken,
  requireRole(ADMIN_OR_FACULTY),
  leagueController.updateLeagueController
);

// Delete league (admin only)
router.delete(
  '/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  leagueController.deleteLeagueController
);

// ==================== LEAGUE REGISTRATION ROUTES ====================

// Register user for a league (all authenticated users)
router.post(
  '/:id/register',
  authenticateToken,
  leagueController.registerForLeagueController
);

// Get user's registration status for a league (all authenticated users)
router.get(
  '/:id/registration',
  authenticateToken,
  leagueController.getUserLeagueRegistrationController
);

// Cancel user's registration for a league (all authenticated users)
router.delete(
  '/:id/registration',
  authenticateToken,
  leagueController.cancelLeagueRegistrationController
);

// Get all registrations for a league (admin only)
router.get(
  '/:id/registrations',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  leagueController.getLeagueRegistrationsController
);

// Toggle registration enabled/disabled for a league (admin only)
router.put(
  '/:id/registration-status',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  leagueController.toggleLeagueRegistrationController
);

// Verify league registration payment (all authenticated users)
router.post(
  '/verify-payment',
  authenticateToken,
  leagueController.verifyLeaguePaymentController
);

export default router;








