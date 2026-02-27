// ============================================================
// booking.routes.ts — UPDATED
//
// Changes from original:
//   1. POST / and POST /multiple — opened to STAFF (they can book)
//   2. PATCH /:id — opened to STAFF (they can update assigned venue bookings)
//   3. DELETE /:id — kept TENANT_ADMIN only (hard admin action)
//   4. NEW: PATCH /:id/cancel — STAFF + TENANT_ADMIN can cancel
//   5. NEW: GET /venue/:venueId/dates — calendar booked dates endpoint
// ============================================================

import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// ── READ ──────────────────────────────────────────────────────────────────────

// GET all bookings for tenant (filtered by role in service)
router.get(
  "/",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.getBookings)
);

// GET booking count (filtered by role in service)
router.get(
  "/count",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.getBookingCount)
);

// GET booked dates for a venue (used by calendar to disable dates)
router.get(
  "/venue/:venueId/dates",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.getBookedDates)
);

// GET bookings by venue
router.get(
  "/venue/:venueId",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.getBookingsByVenue)
);

// GET booking by ID
router.get(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.getBookingById)
);

// ── CREATE ────────────────────────────────────────────────────────────────────

// CREATE single / range booking — STAFF can create for assigned venues
router.post(
  "/",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.createBooking)
);

// CREATE multiple bookings — STAFF can create for assigned venues
router.post(
  "/multiple",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.createMultipleBookings)
);

// ── UPDATE ────────────────────────────────────────────────────────────────────

// UPDATE booking — STAFF can update bookings on assigned venues
router.patch(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.updateBooking)
);

// CANCEL booking (explicit soft-cancel) — STAFF + ADMIN
router.patch(
  "/:id/cancel",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(bookingController.cancelBooking)
);

// ── DELETE (soft, admin only) ─────────────────────────────────────────────────

// DELETE route kept for backwards compat — sets CANCELLED, never deletes record
router.delete(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(bookingController.deleteBooking)
);

export default router;