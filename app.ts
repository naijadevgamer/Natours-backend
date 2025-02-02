import express, { Response, Request, NextFunction } from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import AppError from './utils/appError';
import globalErrorHandler from './controllers/errorController';
import User from './Models/userModel';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
// import xss from 'xss-clean';
import hpp from 'hpp';

declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
      user?: User; // Add the user property to the Request interface
    }
  }
}

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers. This must be on top of everything
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 2, // Limit each IP to 100 requests per `window` (here, per 1 hour).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

// Apply the rate limiting middleware to all requests.
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Third party middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Our own custom middlewares
app.use((req: Request, _res: Response, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// // Get tours
// app.get('/api/v1/tours', getAllTours);
// // Post tours
// app.post('/api/v1/tours', createTour);
// // Get tour by id
// app.get('/api/v1/tours/:id', getTour);
// // Patch tour
// app.patch('/api/v1/tours/:id', updateTour);
// // Delete tour
// app.patch('/api/v1/tours/:id', deleteTour);

// // More efficient way to handle routes
// // Tours
// app.route('/api/v1/tours').get(getAllTours).post(createTour);
// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);

// // Users
// app.route('/api/v1/users').get(getAllUsers).post(createUser);
// app
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

// Mount routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle all unmatched routes
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Could not find ${req.originalUrl} on this server`, 404)); // Pass the error to the error-handling middleware
});

// Global error-handling middleware
app.use(globalErrorHandler);

export default app;
