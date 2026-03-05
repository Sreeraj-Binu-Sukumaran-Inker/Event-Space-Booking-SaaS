import { Request, Response } from "express";
import * as tenantService from "../services/tenant.service";
import { AppError } from "../utils/AppError";

export const getMySettings = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw new AppError("Tenant context missing", 401);

  const settings = await tenantService.getTenantSettings(tenantId);
  res.status(200).json({ success: true, data: settings });
};

export const updateMySettings = async (req: Request, res: Response): Promise<void> => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) throw new AppError("Tenant context missing", 401);

  const updated = await tenantService.updateTenantSettings(tenantId, req.body);
  res.status(200).json({ success: true, message: "Settings updated", data: updated });
};
