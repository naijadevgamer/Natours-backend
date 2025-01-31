import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/userController';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signUp,
} from '../controllers/authController';

const route = express.Router();

route.route('/signup').post(signUp);
route.route('/login').post(login);
route.route('/forgotPassword').post(forgotPassword);
route.route('/resetPassword/:token').patch(resetPassword);

// Users
route.route('/').get(protect, getAllUsers).post(createUser);
route.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default route;
