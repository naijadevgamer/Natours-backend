import express from 'express';
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getUser,
  updateMe,
  updateUser,
} from '../controllers/userController';
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signUp,
  updatePassword,
} from '../controllers/authController';

const route = express.Router();

route.route('/signup').post(signUp);
route.route('/login').post(login);
route.route('/forgotPassword').post(forgotPassword);
route.route('/resetPassword/:token').patch(resetPassword);
route.route('/updatePassword').patch(protect, updatePassword);
route.route('/updateMe').patch(protect, updateMe);
route.route('/deleteMe').delete(protect, deleteMe);

// Users
route.route('/').get(protect, getAllUsers).post(createUser);
route.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default route;
