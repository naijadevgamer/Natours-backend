import { Request, Response } from 'express';
import fs from 'fs';

type Tours = {
  id: number;
  name: string;
  difficulty: string;
  duration: number;
  description: string;
};

const tours: Tours[] = JSON.parse(
  fs.readFileSync(`${__dirname}/../../dev-data/data/tours-simple.json`, 'utf-8')
);

// __________Routes Handlers__________
// Get tours route handler
export const getAllTours = (req: Request, res: Response) => {
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
export const createTour = (req: Request, res: Response) => {
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
export const getTour = (req: Request, res: Response): any => {
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
export const updateTour = (req: Request, res: Response): any => {
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
export const deleteTour = (req: Request, res: Response): any => {
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
