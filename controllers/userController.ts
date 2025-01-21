import { Response, Request } from 'express';
import catchAsync from '../utils/catchAsync';
import User from '../Models/userModel';

export const getAllUsers = catchAsync(
  async (_req: Request, res: Response, _next) => {
    const users = await User.find();

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }
);

export const getUser = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const createUser = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const updateUser = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const deleteUser = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};
