import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { applyCorsHeaders } from "../config/cors";

const errorCode = (statusCode: number): string => {
  if (statusCode === 400 || statusCode === 422) return "VALIDATION_ERROR";
  if (statusCode === 401) return "UNAUTHORIZED";
  if (statusCode === 403) return "FORBIDDEN";
  if (statusCode === 404) return "NOT_FOUND";
  if (statusCode === 409) return "CONFLICT";
  if (statusCode === 429) return "RATE_LIMITED";
  return statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED";
};

// Error Middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Express Error Handler:", err);
  applyCorsHeaders(req, res);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error",
        details: err.errors.map(e => ({ field: e.path.join("."), message: e.message }))
      }
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    error: { code: errorCode(statusCode), message },
    ...(process.env.NODE_ENV === "development" ? { debug: { stack: err.stack } } : {})
  });
};
