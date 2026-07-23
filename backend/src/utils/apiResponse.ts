import { Response } from "express";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

const errorCode = (statusCode: number): string => {
  if (statusCode === 400 || statusCode === 422) return "VALIDATION_ERROR";
  if (statusCode === 401) return "UNAUTHORIZED";
  if (statusCode === 403) return "FORBIDDEN";
  if (statusCode === 404) return "NOT_FOUND";
  if (statusCode === 409) return "CONFLICT";
  if (statusCode === 429) return "RATE_LIMITED";
  return statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED";
};

export const successResponse = <T>(res: Response, data: T, message?: string, statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  } as ApiResponse<T>);
};

export const errorResponse = (res: Response, message: string, statusCode = 400): Response => {
  return res.status(statusCode).json({
    success: false,
    error: { code: errorCode(statusCode), message }
  } as ApiResponse);
};

export const createdResponse = <T>(res: Response, data: T, message = "Created successfully"): Response => {
  return res.status(201).json({
    success: true,
    data,
    message
  } as ApiResponse<T>);
};

export const notFoundResponse = (res: Response, message = "Resource not found"): Response => {
  return res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message }
  } as ApiResponse);
};

export const unauthorizedResponse = (res: Response, message = "Unauthorized"): Response => {
  return res.status(401).json({
    success: false,
    error: { code: "UNAUTHORIZED", message }
  } as ApiResponse);
};

export const forbiddenResponse = (res: Response, message = "Forbidden"): Response => {
  return res.status(403).json({
    success: false,
    error: { code: "FORBIDDEN", message }
  } as ApiResponse);
};

export const validationErrorResponse = (res: Response, message: string): Response => {
  return res.status(422).json({
    success: false,
    error: { code: "VALIDATION_ERROR", message }
  } as ApiResponse);
};

export const serverErrorResponse = (res: Response, message = "Internal server error"): Response => {
  return res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message }
  } as ApiResponse);
};
