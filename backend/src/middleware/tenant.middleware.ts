import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export const enforceTenantIsolation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }

  // Super Admin bypasses tenant isolation
  if (req.user.role === Role.SUPER_ADMIN) {
    next();
    return;
  }

  const tenantIdFromToken = req.user.tenantId;

  if (!tenantIdFromToken) {
    res.status(403).json({ message: "Tenant context missing." });
    return;
  }

  // If route contains tenantId param, validate it
  const tenantIdFromParams = req.params.tenantId;

  if (tenantIdFromParams && tenantIdFromParams !== tenantIdFromToken) {
    res.status(403).json({
      message: "Access denied. Cross-tenant access is not allowed.",
    });
    return;
  }

  next();
};
