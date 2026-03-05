import { Router } from "express";
import { getTenantByDomain } from "../controllers/public.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Public route to resolve a custom domain to a tenant profile
router.get("/tenant/domain/:domain", asyncHandler(getTenantByDomain));

export default router;
