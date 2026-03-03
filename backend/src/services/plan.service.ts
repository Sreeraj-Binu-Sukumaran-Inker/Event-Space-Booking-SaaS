import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

interface CreatePlanInput {
  name: string;
  price: number;
  tenantLimit: number;
  eventSpaceLimit: number;
  staffLimit: number;
  features: string[];
  status?: "ACTIVE" | "INACTIVE";
}

type PlanStatus = "ACTIVE" | "INACTIVE";

interface PlanResponse {
  id: string;
  name: string;
  price: number;
  tenantLimit: number;
  eventSpaceLimit: number;
  staffLimit: number;
  features: string[];
  status: PlanStatus;
  subscriberCount: number;
  createdAt: Date;
}

const mapStatus = (isActive: boolean): PlanStatus =>
  isActive ? "ACTIVE" : "INACTIVE";

const formatPlan = (
  plan: {
    id: string;
    name: string;
    price: number;
    tenantLimit: number;
    eventSpaceLimit: number;
    staffLimit: number;
    features: string[];
    status: boolean;
    createdAt: Date;
  },
  subscriberCount = 0
): PlanResponse => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  tenantLimit: plan.tenantLimit,
  eventSpaceLimit: plan.eventSpaceLimit,
  staffLimit: plan.staffLimit,
  features: plan.features,
  status: mapStatus(plan.status),
  subscriberCount,
  createdAt: plan.createdAt,
});

/**
 * CREATE PLAN
 */
export const createPlan = async (data: CreatePlanInput): Promise<PlanResponse> => {
  const { name, price, tenantLimit, eventSpaceLimit, staffLimit, features, status } = data;

  if (
    !name?.trim() ||
    price === undefined ||
    tenantLimit === undefined ||
    eventSpaceLimit === undefined ||
    staffLimit === undefined
  ) {
    throw new AppError("All required fields must be provided", 400);
  }

  const existing = await prisma.plan.findUnique({ where: { name } });
  if (existing) throw new AppError("Plan name already exists", 409);

  const plan = await prisma.plan.create({
    data: {
      name,
      price,
      tenantLimit,
      eventSpaceLimit,
      staffLimit,
      features,
      ...(status !== undefined && { status: status === "ACTIVE" }),
    },
  });

  return formatPlan(plan, 0);
};

/**
 * GET ALL PLANS
 */
export const getPlans = async (): Promise<PlanResponse[]> => {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tenants: true },
      },
    },
  });
  console.log(plans)
  return plans.map((plan) => formatPlan(plan, plan._count.tenants));
};

/**
 * GET PLAN BY ID
 */
export const getPlanById = async (id: string): Promise<PlanResponse | null> => {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      _count: {
        select: { tenants: true },
      },
    },
  });

  if (!plan) return null;
  return formatPlan(plan, plan._count.tenants);
};

/**
 * UPDATE PLAN
 */
export const updatePlan = async (
  id: string,
  data: Partial<CreatePlanInput>
): Promise<PlanResponse> => {
  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) throw new AppError("Plan not found", 404);

  const { status, ...rest } = data;

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      ...rest,
      ...(status !== undefined && { status: status === "ACTIVE" }),
    },
    include: {
      _count: {
        select: { tenants: true },
      },
    },
  });

  return formatPlan(plan, plan._count.tenants);
};

/**
 * DELETE PLAN
 */
export const deletePlan = async (id: string): Promise<{ message: string }> => {
  const tenantsUsingPlan = await prisma.tenant.count({
    where: { planId: id },
  });

  if (tenantsUsingPlan > 0) {
    throw new AppError("Cannot delete plan assigned to tenants", 409);
  }

  await prisma.plan.delete({ where: { id } });
  return { message: "Plan deleted successfully" };
};