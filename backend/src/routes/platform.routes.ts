import { Router } from "express";
import { createTenant, getAllTenants, updateTenant,changeTenantAdminPassword,patchTenant, getTenantById } from "../controllers/platform.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Get All Tenants (Super Admin Only)
router.get(
  "/tenants",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  asyncHandler(getAllTenants)
);

router.get(
  "/tenants/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  asyncHandler(getTenantById)
);

// Create Tenant (Super Admin Only)
router.post(
  "/tenants",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  asyncHandler(createTenant)
);

// PUT - Full Update
router.put(
  "/tenants/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  asyncHandler(updateTenant)
);

// Patch - change Password of tenant
router.patch(
  "/tenants/:id/password",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  asyncHandler(changeTenantAdminPassword)
);

// PATCH - Partial Update
router.patch(
  "/tenants/:id",
  authenticate,
  authorizeRole("SUPER_ADMIN"),
  asyncHandler(patchTenant)
);

export default router;
