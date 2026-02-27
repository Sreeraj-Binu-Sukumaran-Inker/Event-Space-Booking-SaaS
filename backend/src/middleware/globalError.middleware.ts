import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 ERROR:", err);

  // Known operational error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Normal JS error
  if (err instanceof Error) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};