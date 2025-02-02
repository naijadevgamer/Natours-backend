import { CookieOptions, NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import User from '../Models/userModel';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import sendEmail from '../utils/email';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

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

const createSendToken = (user: User, statusCode: number, res: Response) => {
  const token = signToken(user._id);

  // Set cookie options for secure and HttpOnly cookies in production environment
  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        (Number(process.env.JWT_COOKIE_EXPIRATION) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : undefined,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Set the token as a cookie in the response
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

export const signUp = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    let { name, email, password, confirmPassword } = req.body;

    // Sanitize input
    name = sanitizeHtml(name);
    email = sanitizeHtml(email);
    password = sanitizeHtml(password);
    confirmPassword = sanitizeHtml(confirmPassword);

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

    if (
      !user ||
      !(await user.correctPassword(password, user.password as string))
    )
      return next(new AppError('Incorrect email or password!', 401));

    // 3) If everthing ok, send token to client
    createSendToken(user, 201, res);
  }
);

export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    // 1) Get token and check if its there
    let token;
    if (getAuthHeader(req) && getAuthHeader(req).startsWith('Bearer ')) {
      token = getAuthHeader(req).split(' ')[1];
    } else {
      return next(new AppError('Invalid token format', 401));
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in.', 401));
    }

    console.log(req.headers);

    console.log('Received token:', token);

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

export const restrictTo =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in! Please log in.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      );
    }

    next();
  };

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new AppError('No user found with that email.', 404));
    }

    // Generate random token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500
        )
      );
    }
  }
);

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(req.params.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  if (!req.user) {
    return next(new AppError('You are not logged in! Please log in.', 401));
  }
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!user) {
    return next(new AppError('No user found.', 404));
  }
  if (
    !(await user.correctPassword(
      req.body.passwordCurrent,
      user.password as string
    ))
  ) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended. You should know why, i guess!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
