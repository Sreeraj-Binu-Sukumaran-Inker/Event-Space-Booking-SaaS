import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden: Insufficient permissions", 403));
    }

    next();
  };
};