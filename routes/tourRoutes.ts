import express from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  checkBody,
} from '../controllers/tourController';

// Handle routes using middleware
const router = express.Router();

// Param middleware
// router.param('id', checkId);

// Tours
router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
