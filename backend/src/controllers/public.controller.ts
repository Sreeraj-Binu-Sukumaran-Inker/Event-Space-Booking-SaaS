import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

export const getTenantByDomain = async (req: Request, res: Response): Promise<void> => {
  const domainParam = req.params.domain;
  const domain = Array.isArray(domainParam) ? undefined : domainParam;

  if (!domain) {
    throw new AppError("Domain is required", 400);
  }

  // Find tenant by custom domain
  const tenant = await prisma.tenant.findFirst({
    where: {
      customDomain: domain,
      isActive: true,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      customDomain: true,
      layout: true,
      plan: {
        select: {
          planLayouts: {
            select: { layout: true }
          }
        },
      },
      createdAt: true,
      // We also fetch their available venues so the layout can render them
      venues: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          city: true,
          state: true,
          price: true,
          capacity: true,
          images: {
            select: { url: true }
          }
        }
      }
    }
  });

  if (!tenant) {
    throw new AppError("Tenant not found for this domain", 404);
  }

  const layoutFromPlan = 
    tenant.layout?.key || 
    tenant.plan?.planLayouts?.[0]?.layout?.key || 
    "BASIC";

  res.status(200).json({
    success: true,
    data: {
      ...tenant,
      layout: layoutFromPlan || "BASIC",
    }
  });
};
