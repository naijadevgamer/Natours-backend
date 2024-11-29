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

// Middleware handler for top 5 cheap tours
export const handleTopCheap = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.query.page = '1';
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,duration,difficulty,ratingsAverage,price';

  next();
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
export const getAllTours = async (req: Request, res: Response) => {
  try {
    // BUILD QUERY
    // 1A) Filtering
    const objQuery = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete objQuery[field]);

    // 1B) Advance Filtering
    let queryStr = JSON.stringify(objQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Tour.find(JSON.parse(queryStr));
    // console.log(req.query, objQuery, JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('createdAt');
    }

    // 3) Limiting fields
    if (req.query.fields) {
      const selectBy = (req.query.fields as string).split(',').join(' ');
      query = query.select(selectBy);
    } else {
      query = query.select('-__v');
    }

    // 3) Pagination
    const page = +(req.query.page as string) || 1;
    const limit = +(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const toursNum = await Tour.countDocuments();
      if (skip >= toursNum) throw new Error('This page does not exist');
    }

    // IMPLEMENT/EXECUTE QUERY
    const tour = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tour.length,
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
