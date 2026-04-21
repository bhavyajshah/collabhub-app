import { Response } from 'express';

export const successResponse = <T>(res: Response, data: T, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res: Response, message: string, statusCode = 500, error?: any) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error,
  });
};

export const createdResponse = <T>(res: Response, data: T, message = 'Created successfully') => {
  return successResponse(res, data, message, 201);
};

export const notFoundResponse = (res: Response, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

export const validationErrorResponse = (res: Response, message: string) => {
  return errorResponse(res, message, 400);
};
