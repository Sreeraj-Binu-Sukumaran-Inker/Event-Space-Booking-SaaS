import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

// Removed string layout canonicalization

export const getTenantSettings = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true, layout: true },
  });

  if (!tenant) throw new AppError("Tenant not found", 404);

  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    customDomain: tenant.customDomain,
    layout: tenant.layout,
    plan: tenant.plan,
  };
};

export const updateTenantSettings = async (tenantId: string, data: any) => {

  if (data.layoutId) {
    const requestedLayoutId = data.layoutId;
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { 
        plan: {
          include: { planLayouts: true }
        } 
      },
    });

    if (!tenant) throw new AppError("Tenant not found", 404);

    const allowedLayoutIds = tenant.plan?.planLayouts.map(pl => pl.layoutId) ?? [];

    if (!allowedLayoutIds.includes(requestedLayoutId)) {
      throw new AppError(
        `Selected layout is not permitted for your current plan.`,
        403
      );
    }
  }

  if (data.customDomain) {
    const normalizedDomain = data.customDomain.trim().toLowerCase();

    const existingDomain = await prisma.tenant.findUnique({
      where: { customDomain: normalizedDomain },
    });

    if (existingDomain && existingDomain.id !== tenantId) {
      throw new AppError(
        `Custom domain ${normalizedDomain} is already in use.`,
        409
      );
    }
  }

  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;

  if (data.customDomain !== undefined) {
    const normalized = data.customDomain.trim().toLowerCase();
    updateData.customDomain = normalized === "" ? null : normalized;
  }

  if (data.layoutId !== undefined) {
    updateData.layoutId = data.layoutId;
  }

  return prisma.tenant.update({
    where: { id: tenantId },
    data: updateData,
  });
};
