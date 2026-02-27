import { Router } from "express";
import * as planController from "../controllers/plan.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", asyncHandler(planController.createPlan));
router.get("/", asyncHandler(planController.getPlans));
router.get("/:id", asyncHandler(planController.getPlanById));
router.patch("/:id", asyncHandler(planController.updatePlan));
router.delete("/:id", asyncHandler(planController.deletePlan));

export default router;
