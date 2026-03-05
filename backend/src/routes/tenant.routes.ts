import { Router } from "express";
import { getMySettings, updateMySettings } from "../controllers/tenant.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRole } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Only TENANT_ADMIN can manage their tenant's settings
router.get("/settings", authenticate, authorizeRole("TENANT_ADMIN"), asyncHandler(getMySettings));
router.patch("/settings", authenticate, authorizeRole("TENANT_ADMIN"), asyncHandler(updateMySettings));

export default router;
