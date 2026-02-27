import { Request, Response } from "express";
import * as platformService from "../services/platform.service";
import { AppError } from "../utils/AppError";


export const getAllTenants = async (
  req: Request,
  res: Response
): Promise<void> => {

  const result = await platformService.getAllTenants(req.query);

  res.status(200).json({
    success: true,
    data: result.tenants,
    pagination: result.pagination,
  });
};


// Get Tenant By ID
export const getTenantById = async (
  req: Request,
  res: Response
): Promise<void> => {

   const rawId = req.params.id;

  if (!rawId || Array.isArray(rawId)) {
    throw new AppError("Invalid Tenant ID", 400);
  }
  
  const id = rawId;
  const tenant = await platformService.getTenantById(rawId);

  res.status(200).json({
    success: true,
    data: tenant,
  });
};

export const createTenant = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  if (!req.body?.adminId) {
    throw new AppError("adminId is required", 400);
  }

  if (req.body.adminId !== req.user.id) {
    throw new AppError("adminId does not match authenticated user", 403);
  }

  if (process.env.NODE_ENV !== "production") {
    const { ...rest } = req.body ?? {};
    console.log("[POST /api/platform/tenants] payload:", {
      ...rest,
      authenticatedUserId: req.user.id,
    });
  }

  const tenant = await platformService.createTenant(req.body);

  return res.status(201).json({
    success: true,
    message: "Tenant created successfully",
    data: tenant,
  });
};

export const updateTenant = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const rawId = req.params.id;

  if (!rawId || Array.isArray(rawId)) {
    throw new AppError("Invalid Tenant ID", 400);
  }

  const id = rawId;

  if (!id) {
    throw new AppError("Tenant ID is required", 400);
  }

  const updatedTenant = await platformService.updateTenant(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Tenant updated successfully",
    data: updatedTenant,
  });
};


export const patchTenant = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const rawId = req.params.id;

  if (!rawId || Array.isArray(rawId)) {
    throw new AppError("Invalid Tenant ID", 400);
  }

  const id = rawId;

  if (!id) {
    throw new AppError("Tenant ID is required", 400);
  }

  const updatedTenant = await platformService.patchTenant(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Tenant updated successfully",
    data: updatedTenant,
  });
};

// Change Tenant Password by Admin
export const changeTenantAdminPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const rawId = req.params.id;

  if (!rawId || Array.isArray(rawId)) {
    throw new AppError("Invalid Tenant ID", 400);
  }

  const result = await platformService.changeTenantAdminPassword(
    rawId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
};