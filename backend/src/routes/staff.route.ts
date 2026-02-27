import { Router } from "express";
import * as staffController from "../controllers/staff.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// GET all staff
router.get(
  "/",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(staffController.getStaff)
);

// GET staff count
router.get(
  "/count",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(staffController.getStaffCount)
);

// GET staff by ID
router.get(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(staffController.getStaffById)
);

// CREATE staff
router.post(
  "/",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(staffController.createStaff)
);

// UPDATE staff
router.patch(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(staffController.updateStaff)
);

// RESET staff password
router.patch(
  "/:id/password",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(staffController.resetStaffPassword)
);

// DELETE staff
router.delete(
  "/:id",
  authenticate,
  authorizeRole("TENANT_ADMIN"),
  asyncHandler(staffController.deleteStaff)
);

export default router;