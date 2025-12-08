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

export default router;




