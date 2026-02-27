import { Request, Response } from "express";
import * as planService from "../services/plan.service";
import { AppError } from "../utils/AppError";

export const createPlan = async (req: Request, res: Response) => {
  const plan = await planService.createPlan(req.body);
  res.status(201).json(plan);
};

export const getPlans = async (_req: Request, res: Response) => {
  const plans = await planService.getPlans();
  res.json(plans);
};

export const getPlanById = async (req: Request, res: Response) => {
  const planId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!planId) {
    throw new AppError("Plan id is required", 400);
  }
  const plan = await planService.getPlanById(planId);
  if (!plan) {
    throw new AppError("Plan not found", 404);
  }
  res.json(plan);
};

export const updatePlan = async (req: Request, res: Response) => {
  const planId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!planId) {
    throw new AppError("Plan id is required", 400);
  }
  const plan = await planService.updatePlan(planId, req.body);
  res.json(plan);
};

export const deletePlan = async (req: Request, res: Response) => {
  const planId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!planId) {
    throw new AppError("Plan id is required", 400);
  }
  const plan = await planService.deletePlan(planId);
  res.json(plan);
};
