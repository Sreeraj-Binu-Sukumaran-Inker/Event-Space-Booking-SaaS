import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

const toCanonicalLayout = (layout: string): string => {
  const normalized = layout.trim().toUpperCase();
  if (normalized === "PRO_1") return "PRO";
  if (normalized === "PREMIUM_1") return "PREMIUM";
  return normalized;
};

const normalizeLayouts = (layouts?: string[]): string[] => {
  const canonical = (layouts && layouts.length > 0 ? layouts : ["BASIC"]).map(toCanonicalLayout);
  return Array.from(new Set(canonical));
};

interface CreatePlanInput {
  name: string;
  price: number;
  tenantLimit: number;
  eventSpaceLimit: number;
  staffLimit: number;
  features: string[];
  availableLayouts?: string[];
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
  availableLayouts: string[];
  layouts: { id: string; name: string; key: string }[];
  status: PlanStatus;
  subscriberCount: number;
  createdAt: Date;
}

const mapStatus = (isActive: boolean): PlanStatus =>
  isActive ? "ACTIVE" : "INACTIVE";

const formatPlan = (
  plan: any,
  subscriberCount = 0
): PlanResponse => {
  // Extract layouts from relation
  const layouts = plan.planLayouts?.map((pl: any) => pl.layout) || [];
  return {
    id: plan.id,
    name: plan.name,
    price: plan.price,
    tenantLimit: plan.tenantLimit,
    eventSpaceLimit: plan.eventSpaceLimit,
    staffLimit: plan.staffLimit,
    features: plan.features,
    availableLayouts: layouts.map((l: any) => l.key),
    layouts: layouts,
    status: mapStatus(plan.status),
    subscriberCount,
    createdAt: plan.createdAt,
  };
};

/**
 * CREATE PLAN
 */
export const createPlan = async (data: CreatePlanInput): Promise<PlanResponse> => {
  const { name, price, tenantLimit, eventSpaceLimit, staffLimit, features, availableLayouts = ["BASIC"], status } = data;
  const normalizedLayouts = normalizeLayouts(availableLayouts);

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

  // Map requested layout keys to actual layout IDs
  const dbLayouts = await prisma.layout.findMany({
    where: { key: { in: normalizedLayouts } }
  });

  const plan = await prisma.plan.create({
    data: {
      name,
      price,
      tenantLimit,
      eventSpaceLimit,
      staffLimit,
      features,
      planLayouts: {
        create: dbLayouts.map(l => ({ layoutId: l.id }))
      },
      ...(status !== undefined && { status: status === "ACTIVE" }),
    },
    include: {
      planLayouts: { include: { layout: true } }
    }
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
      planLayouts: { include: { layout: true } }
    },
  });
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
      planLayouts: { include: { layout: true } }
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

  const { status, availableLayouts, ...rest } = data;
  
  let layoutUpdateQuery = {};
  if (availableLayouts !== undefined) {
    const normalizedLayouts = normalizeLayouts(availableLayouts);
    const dbLayouts = await prisma.layout.findMany({
      where: { key: { in: normalizedLayouts } }
    });
    
    // Disconnect old, connect new via replacement
    layoutUpdateQuery = {
      planLayouts: {
        deleteMany: {}, // clean existing connections
        create: dbLayouts.map(l => ({ layoutId: l.id }))
      }
    };
  }

  const plan = await prisma.plan.update({
    where: { id },
    data: {
      ...rest,
      ...layoutUpdateQuery,
      ...(status !== undefined && { status: status === "ACTIVE" }),
    },
    include: {
      _count: {
        select: { tenants: true },
      },
      planLayouts: { include: { layout: true } }
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
