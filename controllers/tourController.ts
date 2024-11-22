import { NextFunction, Request, Response } from 'express';
import Tour from '../Models/tourModel';

// Middleware handler to check if there is body
export const checkBody = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.price || !req.body.name) {
    return res.status(400).json({
      status: 'failed',
      messge: 'Missing name or price',
    });
  }
  return next();
};

// __________Routes Handlers__________
// Create tour route handler
export const createTour = async (req: Request, res: Response) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      createdAt: req.requestTime,
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

// Get tours route handler
export const getAllTours = async (_req: Request, res: Response) => {
  try {
    const tour = await Tour.find();

    res.status(200).json({
      status: 'success',
      results: Tour.length,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

// Get tour route handler
export const getTour = async (req: Request, res: Response): Promise<any> => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

// Update tour route handler
export const updateTour = async (req: Request, res: Response): Promise<any> => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

// Delete tour route handler
export const deleteTour = async (req: Request, res: Response): Promise<any> => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      results: Tour.length,
      data: {
        tour: null,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};
