import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import User from '../Models/userModel';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';

const signToken = (id: unknown) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRATION || '1d',
  });
};

export const signUp = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email, password, confirmPassword } = req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      confirmPassword,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      createdAt: req.requestTime,
      token,
      data: {
        user: newUser,
      },
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    // 1) Check if email and password exist
    if (!email || !password)
      return next(new AppError('Please provide both email and password!', 400));

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    console.log('user: ', user);
    if (!user || !(await user.correctPassword(password, user.password)))
      return next(new AppError('Incorrect email or password!', 401));

    // 3) If everthing ok, send token to client
    const token = signToken(user._id);

    console.log('Token: ', token);

    res.status(201).json({
      status: 'success',
      token,
    });
  }
);
