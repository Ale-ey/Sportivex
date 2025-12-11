import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import qrController from '../controllers/qrController.js';

const router = express.Router();

// Unified QR code scanner route
router.post('/scan', authenticateToken, qrController.scanUnifiedQR);

export default router;

