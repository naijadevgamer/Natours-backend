import express from 'express';
import {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  checkId,
  checkBody,
} from '../controllers/tourController';

// Handle routes using middleware
const router = express.Router();

// Param middleware
router.param('id', checkId);
// router.use(checkBody);

// Tours
router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
