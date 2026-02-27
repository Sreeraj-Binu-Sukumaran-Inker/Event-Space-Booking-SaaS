// ============================================================
// venue.controller.ts — UPDATED
//
// Changes from original:
//   1. All service calls pass caller (CallerContext)
//   2. uploadVenueImages passes caller (for createdById + STAFF check)
//   3. deleteVenueImage passes caller (for STAFF check)
//   4. NEW: setFeaturedImage controller (ADMIN only)
// ============================================================

import { Request, Response } from "express";
import * as venueService from "../services/venue.service";
import { AppError } from "../utils/AppError";
import { Role } from "@prisma/client";

// ─── Helper ───────────────────────────────────────────────────────────────────

const getCaller = (req: Request) => {
  const user = req.user;
  if (!user?.tenantId) throw new AppError("Tenant context missing", 401);
  return {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role as Role,
  };
};

// ─── GET ALL VENUES ───────────────────────────────────────────────────────────

export const getVenues = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venues = await venueService.getVenues(caller);
  res.status(200).json({ success: true, data: venues });
};

// ─── GET VENUE BY ID ──────────────────────────────────────────────────────────

export const getVenueById = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!venueId) throw new AppError("Venue ID is required", 400);

  const venue = await venueService.getVenueById(venueId, caller);
  res.status(200).json({ success: true, data: venue });
};

// ─── CREATE VENUE ─────────────────────────────────────────────────────────────

export const createVenue = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venue = await venueService.createVenue({ ...req.body, tenantId: caller.tenantId });
  res.status(201).json({ success: true, message: "Event space created successfully", data: venue });
};

// ─── UPDATE VENUE ─────────────────────────────────────────────────────────────

export const updateVenue = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!venueId) throw new AppError("Venue ID is required", 400);

  if (caller.role === Role.STAFF) {
    const venue = await venueService.updateVenueForStaff(venueId, caller, req.body);
    res.status(200).json({ success: true, message: "Event space updated successfully", data: venue });
    return;
  }

  const venue = await venueService.updateVenue(venueId, caller.tenantId, req.body);
  res.status(200).json({ success: true, message: "Event space updated successfully", data: venue });
};

// ─── DELETE VENUE ─────────────────────────────────────────────────────────────

export const deleteVenue = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!venueId) throw new AppError("Venue ID is required", 400);

  const result = await venueService.deleteVenue(venueId, caller.tenantId);
  res.status(200).json({ success: true, message: result.message });
};

// ─── GET VENUE COUNT ──────────────────────────────────────────────────────────

export const getVenueCount = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const count = await venueService.getVenueCount(caller);
  res.status(200).json({ success: true, data: { count } });
};

// ─── UPLOAD VENUE IMAGES ──────────────────────────────────────────────────────

export const uploadVenueImages = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!venueId) throw new AppError("Venue ID is required", 400);

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0)
    throw new AppError("No images provided", 400);

  const images = await venueService.uploadVenueImages(
    venueId,
    caller,
    req.files as Express.Multer.File[]
  );

  res.status(201).json({ success: true, message: "Images uploaded successfully", data: images });
};

// ─── SET FEATURED IMAGE (ADMIN ONLY) ─────────────────────────────────────────

export const setFeaturedImage = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.venueId) ? req.params.venueId[0] : req.params.venueId;
  const imageId = Array.isArray(req.params.imageId) ? req.params.imageId[0] : req.params.imageId;

  if (!venueId || !imageId) throw new AppError("Venue ID and Image ID are required", 400);

  const result = await venueService.setFeaturedImage(imageId, venueId, caller.tenantId);
  res.status(200).json({ success: true, message: result.message });
};

// ─── DELETE VENUE IMAGE ───────────────────────────────────────────────────────

export const deleteVenueImage = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.venueId) ? req.params.venueId[0] : req.params.venueId;
  const imageId = Array.isArray(req.params.imageId) ? req.params.imageId[0] : req.params.imageId;

  if (!venueId || !imageId) throw new AppError("Venue ID and Image ID are required", 400);

  const result = await venueService.deleteVenueImage(imageId, venueId, caller);
  res.status(200).json({ success: true, message: result.message });
};

// ─── GET VENUE IMAGES ─────────────────────────────────────────────────────────

export const getVenueImages = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!venueId) throw new AppError("Venue ID is required", 400);

  const images = await venueService.getVenueImages(venueId, caller);
  res.status(200).json({ success: true, data: images });
};
