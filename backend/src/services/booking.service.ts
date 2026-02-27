// ============================================================
// booking.service.ts — COMPLETE REWRITE WITH ALL FIXES
//
// Changes from original:
//   1. createdById tracked on all create operations
//   2. STAFF venue access validated via assignedStaffIds
//   3. deleteBooking → sets status to CANCELLED (never deletes)
//   4. cancelBooking helper (explicit cancel)
//   5. getBookings filtered by role (STAFF sees only assigned venues)
//   6. getBookingsByVenue validates STAFF assignment
//   7. updateBooking validates STAFF assignment
//   8. createBooking validates STAFF assignment
//   9. Conflict check unchanged (correct)
// ============================================================

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import { Role } from "@prisma/client";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CallerContext {
  userId: string;
  tenantId: string;
  role: Role;
}

interface CreateBookingInput {
  venueId: string;
  tenantId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  createdById: string;
}

interface CreateMultipleBookingsInput {
  venueId: string;
  tenantId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  dates: string[];
  totalPrice: number;
  createdById: string;
}

interface UpdateBookingInput {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED";
}

// ─── Venue include shape (reused) ─────────────────────────────────────────────

const venueSelect = {
  id: true,
  name: true,
  location: true,
  price: true,
  city: true,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Conflict check — overlapping PENDING or CONFIRMED bookings
 */
const checkConflict = async (
  venueId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string
) => {
  return prisma.booking.findFirst({
    where: {
      venueId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
    },
  });
};

/**
 * Validate that STAFF is assigned to this venue.
 * TENANT_ADMIN and SUPER_ADMIN bypass this check.
 */
const validateVenueAccess = async (
  venueId: string,
  tenantId: string,
  caller: CallerContext
): Promise<void> => {
  const venue = await prisma.venue.findFirst({
    where: { id: venueId, tenantId },
  });

  if (!venue) throw new AppError("Event space not found", 404);

  if (caller.role === Role.STAFF) {
    if (!venue.assignedStaffIds.includes(caller.userId)) {
      throw new AppError(
        "Access denied. You are not assigned to this event space.",
        403
      );
    }
  }
};

// ─── GET ALL BOOKINGS ─────────────────────────────────────────────────────────

/**
 * TENANT_ADMIN → all bookings for tenant
 * STAFF        → only bookings for venues they are assigned to
 */
export const getBookings = async (caller: CallerContext) => {
  const { tenantId, role, userId } = caller;

  if (role === Role.STAFF) {
    // Find venues this staff member is assigned to
    const assignedVenues = await prisma.venue.findMany({
      where: {
        tenantId,
        assignedStaffIds: { has: userId },
      },
      select: { id: true },
    });

    const venueIds = assignedVenues.map((v) => v.id);

    return prisma.booking.findMany({
      where: { tenantId, venueId: { in: venueIds } },
      include: { venue: { select: venueSelect } },
      orderBy: { createdAt: "desc" },
    });
  }

  // TENANT_ADMIN sees all
  return prisma.booking.findMany({
    where: { tenantId },
    include: { venue: { select: venueSelect } },
    orderBy: { createdAt: "desc" },
  });
};

// ─── GET BOOKINGS BY VENUE ────────────────────────────────────────────────────

export const getBookingsByVenue = async (
  venueId: string,
  caller: CallerContext
) => {
  await validateVenueAccess(venueId, caller.tenantId, caller);

  return prisma.booking.findMany({
    where: { venueId, tenantId: caller.tenantId },
    include: { venue: { select: venueSelect } },
    orderBy: { startDate: "asc" },
  });
};

// ─── GET BOOKING BY ID ────────────────────────────────────────────────────────

export const getBookingById = async (
  bookingId: string,
  caller: CallerContext
) => {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, tenantId: caller.tenantId },
    include: { venue: { select: venueSelect } },
  });

  if (!booking) throw new AppError("Booking not found", 404);

  // STAFF can only view bookings for their assigned venues
  if (caller.role === Role.STAFF) {
    const venue = await prisma.venue.findFirst({
      where: { id: booking.venueId, tenantId: caller.tenantId },
    });
    if (!venue || !venue.assignedStaffIds.includes(caller.userId)) {
      throw new AppError("Access denied.", 403);
    }
  }

  return booking;
};

// ─── GET BOOKED DATES FOR CALENDAR ───────────────────────────────────────────

/**
 * Returns all PENDING + CONFIRMED bookings for a venue.
 * Frontend uses this to disable already-booked dates on the calendar.
 */
export const getBookedDates = async (
  venueId: string,
  caller: CallerContext
) => {
  await validateVenueAccess(venueId, caller.tenantId, caller);

  const bookings = await prisma.booking.findMany({
    where: {
      venueId,
      tenantId: caller.tenantId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      status: true,
    },
    orderBy: { startDate: "asc" },
  });

  return bookings;
};

// ─── CREATE SINGLE / RANGE BOOKING ───────────────────────────────────────────

export const createBooking = async (
  data: CreateBookingInput,
  caller: CallerContext
) => {
  const {
    venueId,
    tenantId,
    clientName,
    clientEmail,
    clientPhone,
    startDate,
    endDate,
    totalPrice,
    createdById,
  } = data;

  if (!clientName?.trim()) throw new AppError("Client name is required", 400);
  if (!startDate || !endDate)
    throw new AppError("Start and end date are required", 400);

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()))
    throw new AppError("Invalid date format", 400);

  if (end < start)
    throw new AppError("End date must be after or equal to start date", 400);

  // Past date guard
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) throw new AppError("Cannot book past dates", 400);

  // Role-based venue access
  await validateVenueAccess(venueId, tenantId, caller);

  // Conflict check
  const conflict = await checkConflict(venueId, start, end);
  if (conflict)
    throw new AppError(
      "Event space is already booked for the selected dates",
      409
    );

  return prisma.booking.create({
    data: {
      venueId,
      tenantId,
      clientName,
      clientEmail,
      clientPhone,
      startDate: start,
      endDate: end,
      totalPrice,
      createdById,
    },
    include: { venue: { select: venueSelect } },
  });
};

// ─── CREATE MULTIPLE BOOKINGS ─────────────────────────────────────────────────

export const createMultipleBookings = async (
  data: CreateMultipleBookingsInput,
  caller: CallerContext
) => {
  const {
    venueId,
    tenantId,
    clientName,
    clientEmail,
    clientPhone,
    dates,
    totalPrice,
    createdById,
  } = data;

  if (!clientName?.trim()) throw new AppError("Client name is required", 400);
  if (!dates || dates.length === 0)
    throw new AppError("At least one date is required", 400);

  // Role-based venue access
  await validateVenueAccess(venueId, tenantId, caller);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate + conflict check ALL dates before creating any
  for (const date of dates) {
    const start = new Date(date);
    const end = new Date(date);

    if (isNaN(start.getTime()))
      throw new AppError(`Invalid date: ${date}`, 400);

    if (start < today)
      throw new AppError(`Cannot book past date: ${start.toDateString()}`, 400);

    const conflict = await checkConflict(venueId, start, end);
    if (conflict)
      throw new AppError(
        `Event space is already booked on ${start.toDateString()}`,
        409
      );
  }

  // Create all in transaction
  return prisma.$transaction(
    dates.map((date) => {
      const start = new Date(date);
      const end = new Date(date);
      return prisma.booking.create({
        data: {
          venueId,
          tenantId,
          clientName,
          clientEmail,
          clientPhone,
          startDate: start,
          endDate: end,
          totalPrice,
          createdById,
        },
      });
    })
  );
};

// ─── UPDATE BOOKING ───────────────────────────────────────────────────────────

export const updateBooking = async (
  bookingId: string,
  caller: CallerContext,
  data: UpdateBookingInput
) => {
  const existing = await prisma.booking.findFirst({
    where: { id: bookingId, tenantId: caller.tenantId },
  });

  if (!existing) throw new AppError("Booking not found", 404);

  // Cannot modify a cancelled booking
  if (existing.status === "CANCELLED")
    throw new AppError("Cannot modify a cancelled booking", 400);

  // STAFF must be assigned to the venue
  if (caller.role === Role.STAFF) {
    const venue = await prisma.venue.findFirst({
      where: { id: existing.venueId, tenantId: caller.tenantId },
    });
    if (!venue || !venue.assignedStaffIds.includes(caller.userId)) {
      throw new AppError("Access denied. You are not assigned to this event space.", 403);
    }
  }

  const start = data.startDate ? new Date(data.startDate) : existing.startDate;
  const end = data.endDate ? new Date(data.endDate) : existing.endDate;

  if (end < start)
    throw new AppError("End date must be after or equal to start date", 400);

  if (data.startDate || data.endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) throw new AppError("Cannot move booking to past dates", 400);

    const conflict = await checkConflict(existing.venueId, start, end, bookingId);
    if (conflict)
      throw new AppError("Event space is already booked for the selected dates", 409);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      ...(data.clientName && { clientName: data.clientName }),
      ...(data.clientEmail !== undefined && { clientEmail: data.clientEmail }),
      ...(data.clientPhone !== undefined && { clientPhone: data.clientPhone }),
      ...(data.startDate && { startDate: start }),
      ...(data.endDate && { endDate: end }),
      ...(data.totalPrice !== undefined && { totalPrice: data.totalPrice }),
      ...(data.status && { status: data.status }),
    },
    include: { venue: { select: venueSelect } },
  });
};

// ─── CANCEL BOOKING (replaces delete) ────────────────────────────────────────

/**
 * Soft-cancel: sets status to CANCELLED. Never deletes records.
 * Both TENANT_ADMIN and STAFF can cancel (with venue assignment check for STAFF).
 */
export const cancelBooking = async (
  bookingId: string,
  caller: CallerContext
) => {
  const existing = await prisma.booking.findFirst({
    where: { id: bookingId, tenantId: caller.tenantId },
  });

  if (!existing) throw new AppError("Booking not found", 404);

  if (existing.status === "CANCELLED")
    throw new AppError("Booking is already cancelled", 400);

  // STAFF assignment check
  if (caller.role === Role.STAFF) {
    const venue = await prisma.venue.findFirst({
      where: { id: existing.venueId, tenantId: caller.tenantId },
    });
    if (!venue || !venue.assignedStaffIds.includes(caller.userId)) {
      throw new AppError("Access denied. You are not assigned to this event space.", 403);
    }
  }

  const cancelled = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
    include: { venue: { select: venueSelect } },
  });

  return { message: "Booking cancelled successfully", data: cancelled };
};

// ─── DELETE BOOKING (ADMIN ONLY — still soft) ────────────────────────────────

/**
 * Kept for backwards compatibility with existing route.
 * Enforces CANCELLED status instead of physical deletion.
 * CONFIRMED bookings cannot be cancelled via this route either.
 */
export const deleteBooking = async (
  bookingId: string,
  caller: CallerContext
) => {
  const existing = await prisma.booking.findFirst({
    where: { id: bookingId, tenantId: caller.tenantId },
  });

  if (!existing) throw new AppError("Booking not found", 404);

  if (existing.status === "CONFIRMED")
    throw new AppError(
      "Cannot cancel a confirmed booking. Update its status first.",
      409
    );

  if (existing.status === "CANCELLED")
    return { message: "Booking is already cancelled" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  return { message: "Booking cancelled successfully" };
};

// ─── GET BOOKING COUNT ────────────────────────────────────────────────────────

export const getBookingCount = async (caller: CallerContext) => {
  const { tenantId, role, userId } = caller;

  if (role === Role.STAFF) {
    const assignedVenues = await prisma.venue.findMany({
      where: { tenantId, assignedStaffIds: { has: userId } },
      select: { id: true },
    });
    const venueIds = assignedVenues.map((v) => v.id);
    return prisma.booking.count({
      where: { tenantId, venueId: { in: venueIds } },
    });
  }

  return prisma.booking.count({ where: { tenantId } });
};