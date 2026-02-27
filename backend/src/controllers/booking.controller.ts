// ============================================================
// booking.controller.ts — UPDATED
//
// Changes from original:
//   1. All service calls now pass `caller` (CallerContext)
//   2. createdById injected from req.user.id
//   3. deleteBooking renamed to cancelBooking in the explicit route
//   4. New getBookedDates controller for calendar
// ============================================================

import { Request, Response } from "express";
import * as bookingService from "../services/booking.service";
import { AppError } from "../utils/AppError";
import { Role } from "@prisma/client";

// ─── Helper: build CallerContext from req.user ────────────────────────────────

const getCaller = (req: Request) => {
  const user = req.user;
  if (!user?.tenantId) throw new AppError("Tenant context missing", 401);
  return {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role as Role,
  };
};

// ─── GET ALL BOOKINGS ─────────────────────────────────────────────────────────

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const bookings = await bookingService.getBookings(caller);
  res.status(200).json({ success: true, data: bookings });
};

// ─── GET BOOKED DATES (for calendar) ─────────────────────────────────────────

export const getBookedDates = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.venueId)
    ? req.params.venueId[0]
    : req.params.venueId;

  if (!venueId) throw new AppError("Venue ID is required", 400);

  const dates = await bookingService.getBookedDates(venueId, caller);
  res.status(200).json({ success: true, data: dates });
};

// ─── GET BOOKINGS BY VENUE ────────────────────────────────────────────────────

export const getBookingsByVenue = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const venueId = Array.isArray(req.params.venueId)
    ? req.params.venueId[0]
    : req.params.venueId;

  if (!venueId) throw new AppError("Venue ID is required", 400);

  const bookings = await bookingService.getBookingsByVenue(venueId, caller);
  res.status(200).json({ success: true, data: bookings });
};

// ─── GET BOOKING BY ID ────────────────────────────────────────────────────────

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!bookingId) throw new AppError("Booking ID is required", 400);

  const booking = await bookingService.getBookingById(bookingId, caller);
  res.status(200).json({ success: true, data: booking });
};

// ─── CREATE SINGLE / RANGE BOOKING ───────────────────────────────────────────

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);

  const booking = await bookingService.createBooking(
    { ...req.body, tenantId: caller.tenantId, createdById: caller.userId },
    caller
  );

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
};

// ─── CREATE MULTIPLE BOOKINGS ─────────────────────────────────────────────────

export const createMultipleBookings = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const { dates, venueId, clientName, clientEmail, clientPhone, totalPrice } = req.body;

  if (!dates || !Array.isArray(dates) || dates.length === 0)
    throw new AppError("dates must be a non-empty array", 400);

  const bookings = await bookingService.createMultipleBookings(
    {
      venueId,
      tenantId: caller.tenantId,
      clientName,
      clientEmail,
      clientPhone,
      dates,
      totalPrice,
      createdById: caller.userId,
    },
    caller
  );

  res.status(201).json({
    success: true,
    message: `${bookings.length} booking(s) created successfully`,
    data: bookings,
  });
};

// ─── UPDATE BOOKING ───────────────────────────────────────────────────────────

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!bookingId) throw new AppError("Booking ID is required", 400);

  const booking = await bookingService.updateBooking(bookingId, caller, req.body);
  res.status(200).json({
    success: true,
    message: "Booking updated successfully",
    data: booking,
  });
};

// ─── CANCEL BOOKING (explicit cancel route) ───────────────────────────────────

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!bookingId) throw new AppError("Booking ID is required", 400);

  const result = await bookingService.cancelBooking(bookingId, caller);
  res.status(200).json({ success: true, message: result.message, data: result.data });
};

// ─── DELETE BOOKING (backwards-compat, soft-cancel) ──────────────────────────

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!bookingId) throw new AppError("Booking ID is required", 400);

  const result = await bookingService.deleteBooking(bookingId, caller);
  res.status(200).json({ success: true, message: result.message });
};

// ─── GET BOOKING COUNT ────────────────────────────────────────────────────────

export const getBookingCount = async (req: Request, res: Response): Promise<void> => {
  const caller = getCaller(req);
  const count = await bookingService.getBookingCount(caller);
  res.status(200).json({ success: true, data: { count } });
};