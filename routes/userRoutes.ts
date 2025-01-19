import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/userController';
import { signUp } from '../controllers/authController';

const route = express.Router();

route.route('/signup').post(signUp);

// Users
route.route('/').get(getAllUsers).post(createUser);
route.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default route;
