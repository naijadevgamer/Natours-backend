import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import User from '../Models/userModel';

export const signUp = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });
    res.status(201).json({
      status: 'success',
      createdAt: req.requestTime,
      data: {
        user: newUser,
      },
    });
  }
);
