import { Response, Request, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import User from '../Models/userModel';
import AppError from '../utils/appError';

const filterObj = (
  obj: Record<string, unknown>,
  ...allowedFields: string[]
): Record<string, unknown> => {
  const newObj: Record<string, unknown> = {};
  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) newObj[field] = obj[field];
  });
  return newObj;
};

export const getAllUsers = catchAsync(
  async (_req: Request, res: Response, _next) => {
    const users = await User.find();

    console.log('Users', users);

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

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update user document
    if (!req.user) {
      return next(new AppError('You are not logged in! Please log in.', 401));
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }
);

export const deleteMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('You are not logged in! Please log in.', 401));
  }

  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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
