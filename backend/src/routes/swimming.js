import express from 'express';
import swimmingController from '../controllers/swimmingController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { Roles } from '../constants/roles.js';

const router = express.Router();

const ADMIN_ONLY = [Roles.ADMIN];
const ADMIN_OR_FACULTY = [Roles.ADMIN, Roles.FACULTY];

// ==================== PUBLIC ROUTES ====================
// (Still require authentication, but no role restriction)

// Get all rules and regulations (accessible to all authenticated users)
router.get('/rules', authenticateToken, swimmingController.getRules);

// ==================== TIME SLOTS ROUTES ====================

// Get all time slots (accessible to all authenticated users)
router.get('/time-slots', authenticateToken, swimmingController.getTimeSlots);

// Get specific time slot
router.get('/time-slots/:id', authenticateToken, swimmingController.getTimeSlotById);

// Create time slot (admin/faculty only)
router.post(
  '/time-slots',
  authenticateToken,
  requireRole(ADMIN_OR_FACULTY),
  swimmingController.createTimeSlot
);

// Update time slot (admin/faculty only)
router.put(
  '/time-slots/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.updateTimeSlot
);

// Delete time slot (admin/faculty only)
router.delete(
  '/time-slots/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.deleteTimeSlot
);

// ==================== ATTENDANCE ROUTES ====================

// Scan QR code to check in (all authenticated users)
router.post('/attendance/scan-qr', authenticateToken, swimmingController.scanQRCode);

// Manual check-in (admin/faculty only)
router.post(
  '/attendance/check-in',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.manualCheckIn
);

// Get attendance for a time slot (all authenticated users)
router.get('/attendance/:timeSlotId', authenticateToken, swimmingController.getAttendance);

// Get current attendance count (all authenticated users)
router.get('/attendance/current-count/:timeSlotId', authenticateToken, swimmingController.getCurrentCount);

// Get user's attendance history
router.get('/attendance/user/history', authenticateToken, swimmingController.getUserHistory);

// ==================== WAITLIST ROUTES ====================

// Join waitlist (all authenticated users)
router.post('/waitlist/join', authenticateToken, swimmingController.joinWaitlist);

// Leave waitlist (all authenticated users)
router.delete('/waitlist/leave', authenticateToken, swimmingController.leaveWaitlist);

// Get waitlist for a time slot (all authenticated users)
router.get('/waitlist/:timeSlotId', authenticateToken, swimmingController.getWaitlist);

// ==================== RULES ROUTES (Admin Only) ====================

// Create rule (admin/faculty only)
router.post(
  '/rules',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.createRule
);

// Update rule (admin/faculty only)
router.put(
  '/rules/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.updateRule
);

// Delete rule (admin/faculty only)
router.delete(
  '/rules/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.deleteRule
);

// ==================== QR CODE ROUTES (Admin Only) ====================

// Get all QR codes (admin/faculty only)
router.get(
  '/qr-codes',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.getQRCodes
);

// Create QR code (admin/faculty only)
router.post(
  '/qr-codes',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.createQRCode
);

// Update QR code (admin/faculty only)
router.put(
  '/qr-codes/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.updateQRCode
);

// Delete QR code (admin/faculty only)
router.delete(
  '/qr-codes/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  swimmingController.deleteQRCode
);

export default router;

