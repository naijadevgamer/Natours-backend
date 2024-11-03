import { Application, Response, Request, NextFunction } from 'express';
import fs from 'fs';
import express from 'express';
import morgan from 'morgan';

const app: Application = express();

// Extend the Request interface to include `requestTime`
declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
    }
  }
}

app.use(express.json());

// Third party middleware
app.use(morgan('dev'));

// Our own custom middlewares
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Hello from the middleware 😄');
  next();
});
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

type Tours = {
  id: number;
  name: string;
  difficulty: string;
  duration: number;
  description: string;
};

const tours: Tours[] = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// __________Routes Handlers__________
// Get tours route handler
const getAllTours = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

// Create tour route handler
const createTour = (req: Request, res: Response) => {
  const id = tours[tours.length - 1].id + 1;

  const obj = Object.assign({ id }, req.body);
  tours.push(obj);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        results: tours.length,
        data: {
          tours,
        },
      });
    }
  );
};

// Get tour route handler
const getTour = (req: Request, res: Response): any => {
  const tour = tours.find((tour) => tour.id === +req.params.id);

  if (!tour) {
    return res.status(404).json({
      status: 'Not found',
      data: {
        tour,
      },
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

// Update tour route handler
const updateTour = (req: Request, res: Response): any => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Update tour here',
    },
  });
};

// Delete tour route handler
const deleteTour = (req: Request, res: Response): any => {
  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'Invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: {
      tour: null,
    },
  });
};

// Get tours route handler
const getAllUsers = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};
const getUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};
const createUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};
const updateUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};
const deleteUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

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

// Handle routes using middleware
const tourRouter = express.Router();
const userRouter = express.Router();

// Tours
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// Users
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// Mount routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

const port: number = 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
