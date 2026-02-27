import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { AppError } from "../utils/AppError";

interface JwtPayload {
  id: string;
  role: Role;
  tenantId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Not authorized. No token provided.", 401));
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new AppError("JWT_SECRET is not defined", 500));
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };

    next();
  } catch {
    return next(new AppError("Invalid or expired token.", 401));
  }
};