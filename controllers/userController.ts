import { Response, Request } from 'express';

export const getAllUsers = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet',
  });
};

export const getUser = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const createUser = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const updateUser = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};

export const deleteUser = (_req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    messge: 'This route is not yet defined',
  });
};
