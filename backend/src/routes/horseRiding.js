import express from 'express';
import * as horseRidingController from '../controllers/horseRidingController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { Roles } from '../constants/roles.js';

const router = express.Router();

const ADMIN_ONLY = [Roles.ADMIN];
const ADMIN_OR_FACULTY = [Roles.ADMIN, Roles.FACULTY];

// ==================== TIME SLOTS ROUTES ====================

// Get all time slots (accessible to all authenticated users)
router.get('/time-slots', authenticateToken, horseRidingController.getTimeSlots);

// Get specific time slot
router.get('/time-slots/:id', authenticateToken, horseRidingController.getTimeSlotById);

// Create time slot (admin only)
router.post(
  '/time-slots',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.createTimeSlot
);

// Update time slot (admin only)
router.put(
  '/time-slots/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.updateTimeSlot
);

// Delete time slot (admin only)
router.delete(
  '/time-slots/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.deleteTimeSlot
);

// ==================== RULES ROUTES ====================

// Get all rules (accessible to all authenticated users)
router.get('/rules', authenticateToken, horseRidingController.getRules);

// Create rule (admin only)
router.post(
  '/rules',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.createRule
);

// Update rule (admin only)
router.put(
  '/rules/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.updateRule
);

// Delete rule (admin only)
router.delete(
  '/rules/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.deleteRule
);

// ==================== EQUIPMENT ROUTES ====================

// Get all equipment (accessible to all authenticated users)
router.get('/equipment', authenticateToken, horseRidingController.getEquipment);

// Create equipment (admin only)
router.post(
  '/equipment',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.createEquipment
);

// Update equipment (admin only)
router.put(
  '/equipment/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.updateEquipment
);

// Delete equipment (admin only)
router.delete(
  '/equipment/:id',
  authenticateToken,
  requireRole(ADMIN_ONLY),
  horseRidingController.deleteEquipment
);

// ==================== REGISTRATION ROUTES ====================

// Get all registrations with user details (admin only)
router.get('/registrations', authenticateToken, requireRole(ADMIN_ONLY), horseRidingController.getAllRegistrations);

// Get user registration
router.get('/registration', authenticateToken, horseRidingController.getUserRegistration);

// Get checkout URL for pending registration
router.get('/registration/:registrationId/checkout-url', authenticateToken, horseRidingController.getRegistrationCheckoutUrl);

// Create registration (initiate payment)
router.post('/registration', authenticateToken, horseRidingController.createRegistration);

// Verify registration payment
router.post('/registration/verify-payment', authenticateToken, horseRidingController.verifyRegistrationPayment);

// ==================== MONTHLY PAYMENT ROUTES ====================

// Create monthly payment (initiate payment)
router.post('/monthly-payment', authenticateToken, horseRidingController.createMonthlyPayment);

// Verify monthly payment
router.post('/monthly-payment/verify-payment', authenticateToken, horseRidingController.verifyMonthlyPayment);

// Get user's monthly payment history
router.get('/monthly-payments', authenticateToken, horseRidingController.getUserMonthlyPayments);

// ==================== ENROLLMENT ROUTES ====================

// Get user enrollments
router.get('/enrollments', authenticateToken, horseRidingController.getUserEnrollments);

// Create enrollment (after payment)
router.post('/enrollments', authenticateToken, horseRidingController.createEnrollment);

// ==================== EQUIPMENT PURCHASE ROUTES ====================

// Get user equipment purchases
router.get('/equipment-purchases', authenticateToken, horseRidingController.getUserEquipmentPurchases);

// Create equipment purchase (initiate payment)
router.post('/equipment-purchases', authenticateToken, horseRidingController.createEquipmentPurchase);

// Verify equipment purchase payment
router.post('/equipment-purchases/verify-payment', authenticateToken, horseRidingController.verifyEquipmentPurchasePayment);

// ==================== WEBHOOK ROUTES ====================

// Stripe webhook (no authentication - uses signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), horseRidingController.handleStripeWebhook);

export default router;

