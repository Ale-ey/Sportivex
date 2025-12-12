import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  getExercisesController,
  getExerciseByIdController,
  startWorkoutController,
  saveWorkoutController,
  getProgressController,
  getWorkoutHistoryController,
  getActiveWorkoutController,
  finishWorkoutController,
  getGoalsController,
  saveGoalController,
  getStatsController,
  getGymRegistrationController,
  checkGymRegistrationStatusController,
  createGymRegistrationController,
  verifyGymRegistrationPaymentController,
  createGymMonthlyPaymentController,
  verifyGymMonthlyPaymentController,
  getGymMonthlyPaymentsController,
  processGymQRScanController,
  getGymAttendanceController,
  getGymQRCodesController,
  createGymQRCodeController,
  updateGymQRCodeController,
  deleteGymQRCodeController
} from '../controllers/gymController.js';
import { requireRole } from '../middlewares/auth.js';
import { Roles } from '../constants/roles.js';
import { checkGymRegistrationStatus } from '../services/gymService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Middleware to check gym registration status (for protected routes)
const requireGymRegistration = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const status = await checkGymRegistrationStatus(userId);

    if (!status.isActive) {
      // Use 402 Payment Required instead of 403 to avoid triggering logout
      // This is a special status code that won't be treated as an auth error
      return res.status(402).json({
        success: false,
        message: status.message || 'Gym registration is required. Please register and complete payment to use gym facilities.',
        requiresRegistration: !status.isRegistered,
        requiresPayment: status.isPaymentDue,
        registration: status.registration,
        code: 'GYM_REGISTRATION_REQUIRED' // Special code to identify this error
      });
    }

    req.gymRegistration = status.registration;
    next();
  } catch (error) {
    console.error('Error in requireGymRegistration middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking gym registration status'
    });
  }
};

// Exercise routes (no registration required to view)
router.get('/exercises', getExercisesController);
router.get('/exercises/:id', getExerciseByIdController);

// Registration routes (no registration required)
router.get('/registration', getGymRegistrationController);
router.get('/registration/status', checkGymRegistrationStatusController);
router.post('/registration', createGymRegistrationController);
router.post('/registration/verify-payment', verifyGymRegistrationPaymentController);
router.post('/registration/monthly-payment', createGymMonthlyPaymentController);
router.post('/registration/monthly-payment/verify', verifyGymMonthlyPaymentController);
router.get('/registration/monthly-payments', getGymMonthlyPaymentsController);

// Attendance routes (require registration)
router.post('/attendance/scan-qr', requireGymRegistration, processGymQRScanController);
router.get('/attendance', requireGymRegistration, getGymAttendanceController);

// Workout routes (require registration)
router.post('/workouts/start', requireGymRegistration, startWorkoutController);
router.post('/workouts/save', requireGymRegistration, saveWorkoutController);
router.get('/workouts/active', requireGymRegistration, getActiveWorkoutController);
router.post('/workouts/finish', requireGymRegistration, finishWorkoutController);
router.get('/workouts/history', requireGymRegistration, getWorkoutHistoryController);

// Progress routes (require registration)
router.get('/progress', requireGymRegistration, getProgressController);
router.get('/stats', requireGymRegistration, getStatsController);

// Goals routes (require registration)
router.get('/goals', requireGymRegistration, getGoalsController);
router.post('/goals', requireGymRegistration, saveGoalController);
router.put('/goals/:id', requireGymRegistration, saveGoalController);

// QR Code routes (admin only)
router.get('/qr-codes', requireRole([Roles.ADMIN]), getGymQRCodesController);
router.post('/qr-codes', requireRole([Roles.ADMIN]), createGymQRCodeController);
router.put('/qr-codes/:id', requireRole([Roles.ADMIN]), updateGymQRCodeController);
router.delete('/qr-codes/:id', requireRole([Roles.ADMIN]), deleteGymQRCodeController);

export default router;

