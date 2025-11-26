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
  getStatsController
} from '../controllers/gymController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Exercise routes
router.get('/exercises', getExercisesController);
router.get('/exercises/:id', getExerciseByIdController);

// Workout routes
router.post('/workouts/start', startWorkoutController);
router.post('/workouts/save', saveWorkoutController);
router.get('/workouts/active', getActiveWorkoutController);
router.post('/workouts/finish', finishWorkoutController);
router.get('/workouts/history', getWorkoutHistoryController);

// Progress routes
router.get('/progress', getProgressController);
router.get('/stats', getStatsController);

// Goals routes
router.get('/goals', getGoalsController);
router.post('/goals', saveGoalController);
router.put('/goals/:id', saveGoalController);

export default router;

