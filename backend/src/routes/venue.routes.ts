// ============================================================
// venue.routes.ts — UPDATED
//
// Changes from original:
//   1. GET / and GET /:id — service now filters by role (no route change needed)
//   2. POST /:id/images — opened to STAFF (they can upload)
//   3. DELETE /:venueId/images/:imageId — opened to STAFF (they can delete)
//   4. NEW: PATCH /:venueId/images/:imageId/feature — ADMIN only (set featured)
// ============================================================

import { Router } from "express";
import * as venueController from "../controllers/venue.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Venue CRUD ────────────────────────────────────────────────────────────────

router.get(
  "/",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(venueController.getVenues)
);

router.get(
  "/count",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(venueController.getVenueCount)
);

router.get(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(venueController.getVenueById)
);

router.get(
  "/:id/images",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(venueController.getVenueImages)
);

router.post(
  "/",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(venueController.createVenue)
);

router.patch(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(venueController.updateVenue)
);

router.delete(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(venueController.deleteVenue)
);

// ── Image Routes ──────────────────────────────────────────────────────────────

// Upload images — STAFF can upload to assigned venues
router.post(
  "/:id/images",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  upload.array("images", 10),
  asyncHandler(venueController.uploadVenueImages)
);

// Set featured image — ADMIN only (used on public landing page)
router.patch(
  "/:venueId/images/:imageId/feature",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(venueController.setFeaturedImage)
);

// Delete image — STAFF can delete from assigned venues
router.delete(
  "/:venueId/images/:imageId",
  authenticate,
  authorizeRole("TENANT_ADMIN", "STAFF"),
  asyncHandler(venueController.deleteVenueImage)
);

export default router;
