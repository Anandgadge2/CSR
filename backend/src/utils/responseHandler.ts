import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Standard Success Response Handler
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || "Request executed successfully"
  };
  return res.status(statusCode).json(response);
};

/**
 * Standard Error Response Handler
 */
export const sendError = (
  res: Response,
  statusCode: number = 400,
  code: string = "BAD_REQUEST",
  message: string = "An error occurred",
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
  return res.status(statusCode).json(response);
};
