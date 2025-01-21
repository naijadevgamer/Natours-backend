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

const getAuthHeader = (req: Request): string => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    throw new AppError('Authorization header is missing!', 401);
  }
  return authHeader;
};

export const signUp = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email, password, confirmPassword, passwordChangedAt } =
      req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      confirmPassword,
      passwordChangedAt,
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

    if (!user || !(await user.correctPassword(password, user.password)))
      return next(new AppError('Incorrect email or password!', 401));

    // 3) If everthing ok, send token to client
    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
    });
  }
);

export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    // 1) Get token and check if its there
    let token;
    if (getAuthHeader(req) && getAuthHeader(req).startsWith('Bearer ')) {
      token = getAuthHeader(req).split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in.', 401));
    }

    // console.log(req.headers, token);

    // 2) Token verification
    const jwtSecret = process.env.JWT_SECRET as string;

    const verifyToken = (token: string, secret: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        });
      });
    };

    const decoded = await verifyToken(token, jwtSecret);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('User no longer exists.', 401));
    }

    // 4) Check if user changed password after token was issued
    const isUserChangedPassword = currentUser.changePasswordAfter(decoded.iat);

    if (isUserChangedPassword) {
      return next(
        new AppError('User changed password. Please log in again', 401)
      );
    }

    // 5) Grant access to protected routes
    req.user = currentUser;
    next();
  }
);
