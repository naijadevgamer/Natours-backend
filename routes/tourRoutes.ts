import express from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  checkBody,
  handleTopCheap,
  getTourStats,
  getMonthlyPlan,
} from '../controllers/tourController';
import { protect, restrictTo } from '../controllers/authController';

// Handle routes using middleware
const router = express.Router();

// Param middleware
// router.param('id', checkId);

// Top 5 cheap tours route aliasing
router.route('/top-5-cheap').get(handleTopCheap, getAllTours);

// Get tour stats using aggregate
router.route('/tour-stats').get(getTourStats);

// Get monthly plans
router.route('/monthly-plans').get(getMonthlyPlan);
router.route('/monthly-plans/:year').get(getMonthlyPlan);

// Tours
router.route('/').get(getAllTours).post(checkBody, createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

export default router;
