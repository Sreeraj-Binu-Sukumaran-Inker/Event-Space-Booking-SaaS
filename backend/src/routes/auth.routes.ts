import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(AuthController.registerTenant));
router.post("/login", asyncHandler(AuthController.login));
router.post("/refresh", asyncHandler(AuthController.refresh));
router.post("/logout", asyncHandler(AuthController.logout));

export default router;