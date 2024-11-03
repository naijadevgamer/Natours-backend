import { Response, Request } from 'express';

export const getAllUsers = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet',
  });
};

export const getUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const createUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const updateUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const deleteUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};
