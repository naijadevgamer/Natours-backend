import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/userController';
import { login, protect, signUp } from '../controllers/authController';

const route = express.Router();

route.route('/signup').post(signUp);
route.route('/login').post(login);

// Users
route.route('/').get(protect, getAllUsers).post(createUser);
route.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default route;
