import express from 'express';
import { Response, Request } from 'express';
import morgan from 'morgan';
import tourRouter from './public/routes/tourRoutes';
import userRouter from './public/routes/userRoutes';

const app = express();

// Extend the Request interface to include `requestTime`
declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT?: number;
    }
  }
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Third party middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Our own custom middlewares
app.use((req: Request, res: Response, next) => {
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

export default app;
