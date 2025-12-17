import express from 'express';
import authenticateToken from './middleware/auth.js';
import adminController from './controllers/adminController.js';
import clientController from './controllers/clientController.js';

const router = express.Router();


// Admin Routes
router.get('/users', authenticateToken, adminController.GETHandler);
router.post('/users', authenticateToken, adminController.POSTHandler);
router.get('/orders', authenticateToken, adminController.GETHandler);

// Client Routes
router.get('/profile', authenticateToken, clientController.GETHandler);
router.put('/profile', authenticateToken, clientController.UPDATEHandler);

export default router;