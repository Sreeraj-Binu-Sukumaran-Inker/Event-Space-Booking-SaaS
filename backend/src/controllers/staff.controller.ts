import { Request, Response, NextFunction } from "express";
import * as staffService from "../services/staff.service";
import { AppError } from "../utils/AppError";

/**
 * GET ALL STAFF
 */
export const getStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new AppError("Tenant ID not found in token", 401);
  }

  const staff = await staffService.getStaff(tenantId);

  res.status(200).json({
    success: true,
    data: staff,
  });
};

/**
 * GET STAFF BY ID
 */
export const getStaffById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new AppError("Tenant ID not found in token", 401);
  }

  const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!staffId) {
    throw new AppError("Staff ID is required", 400);
  }

  const staff = await staffService.getStaffById(staffId, tenantId);

  res.status(200).json({
    success: true,
    data: staff,
  });
};

/**
 * CREATE STAFF
 */
export const createStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new AppError("Tenant ID not found in token", 401);
  }

  try {
    const staff = await staffService.createStaff({
      ...req.body,
      tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: staff,
    });
  } catch (err) {
    if (
      err instanceof AppError &&
      err.statusCode === 403 &&
      err.message.includes("Staff limit")
    ) {
      res.status(403).json({ message: err.message });
      return;
    }

    if (err instanceof AppError) {
      return next(err);
    }

    console.error("createStaff failed:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * UPDATE STAFF
 */
export const updateStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new AppError("Tenant ID not found in token", 401);
  }

  const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!staffId) {
    throw new AppError("Staff ID is required", 400);
  }

  const staff = await staffService.updateStaff(staffId, tenantId, req.body);

  res.status(200).json({
    success: true,
    message: "Staff member updated successfully",
    data: staff,
  });
};

/**
 * DELETE STAFF
 */
export const deleteStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new AppError("Tenant ID not found in token", 401);
  }

  const staffId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!staffId) {
    throw new AppError("Staff ID is required", 400);
  }

  const result = await staffService.deleteStaff(staffId, tenantId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

/**
 * RESET STAFF PASSWORD
 */
export const resetStaffPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new AppError("Tenant ID not found in token", 401);
  }

  const staffId =Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!staffId) {
    throw new AppError("Staff ID is required", 400);
  }

  const result = await staffService.resetStaffPassword(
    staffId,
    tenantId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

/**
 * GET STAFF COUNT
 */
export const getStaffCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new AppError("Tenant ID not found in token", 401);
  }

  const count = await staffService.getStaffCount(tenantId);

  res.status(200).json({
    success: true,
    data: { count },
  });
};
