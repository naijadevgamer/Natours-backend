import { NextFunction, Response, Request } from 'express';
import AppError from '../utils/appError';

export default (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack); // Log the stack trace for debugging

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    status,
    message: err.message,
  });
};
