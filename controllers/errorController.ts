import { NextFunction, Response, Request } from 'express';
import AppError from '../utils/appError';

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err: any) => {
  const message = `A tour with this name already exists "${err.keyValue.name}". Please choose a different name.`;
  return new AppError(message, 409);
};

// Function to handle Mongoose validation errors
const handleValidationError = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => {
    switch (el.name) {
      case 'CastError':
        return `Invalid value '${el.value}' for ${el.path}. Expected type: ${el.kind}.`;
      case 'ValidatorError':
        return el.message; // Use the provided message for validation errors
      default:
        return `Error in field '${el.path}': ${el.message}`;
    }
  });

  const message = `Validation failed. ${errors.join(' ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  // Handles operational/trusted error: send message to client
  console.log(err.isOperational);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Handles programmming errors: Don't leak error details
    console.log('Error 🔥', err);

    // Send a generic message
    res.status(500).json({
      status: 'fail',
      message: 'Something went very wrong',
    });
  }
};

// Usage in error middleware
const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack); // Log the stack trace for debugging

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
