import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";

interface AdminInput {
  name: string;
  email: string;
  password: string;
}

interface CreateTenantInput {
  name: string;
  email?: string; // Optional main tenant email
  phone?: string;
  planId: string;
  adminId: string; // The ID of the SUPER_ADMIN creating this
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

interface GetTenantsQuery {
  page?: string;
  limit?: string;
  search?: string;
}

// Get tenant by ID
export const getTenantById = async (id: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
  });

  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }
  return tenant;
};

export const createTenant = async (data: CreateTenantInput) => {
  const { name, email, phone, planId, adminId, adminName, adminEmail, adminPassword } = data;

  // ✅ Basic validations
  if (!name?.trim()) {
    throw new AppError("Tenant name is required", 400);
  }

  if (!planId?.trim()) {
    throw new AppError("planId is required", 400);
  }

  if (!adminId?.trim()) {
    throw new AppError("adminId is required", 400);
  }

  if (!adminName?.trim()) {
    throw new AppError("Admin name is required", 400);
  }

  if (!adminEmail?.trim()) {
    throw new AppError("Admin email is required", 400);
  }

  if (!adminPassword?.trim() || adminPassword.length < 6) {
    throw new AppError("Admin password must be at least 6 characters", 400);
  }

  // ✅ Check plan exists
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new AppError("Subscription plan not found", 404);
  }

  // ✅ Check creator exists and is SUPER_ADMIN
  const creator = await prisma.user.findUnique({
    where: { id: adminId },
  });

  if (!creator) {
    throw new AppError("Creator admin not found", 404);
  }

  if (creator.role !== "SUPER_ADMIN") {
    throw new AppError("Only super admins can create tenants", 403);
  }

  // ✅ Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    throw new AppError("Email is already in use by another user.", 409);
  }

  // ✅ Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // ✅ Use transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1️⃣ Create tenant
    const tenant = await tx.tenant.create({
      data: {
        name,
        email,
        phone,
        planId,
        createdById: adminId,
      },
      include: {
        plan: true,
      },
    });

    // 2️⃣ Create single tenant admin user
    await tx.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "TENANT_ADMIN",
        tenantId: tenant.id,
      },
    });

    return tenant; // 🔥 IMPORTANT — return only tenant
  });

  return result;
};

export const getAllTenants = async (query: GetTenantsQuery) => {
  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "10");
  const search = query.search || "";

  const skip = (page - 1) * limit;

  const whereCondition = search
    ? {
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            users: true,
            venues: true,
          },
        },
        plan: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.tenant.count({
      where: whereCondition,
    }),
  ]);

  return {
    tenants,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateTenant = async(
  tenantId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    planId?: string;
    status?: "ACTIVE" | "SUSPENDED";
  }
) => {
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  })

  if (!existingTenant || existingTenant.isDeleted) {
    throw new AppError("Tenant not found", 404);
  }

  if (data.planId) {
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new AppError("Subscription plan not found", 404);
    }
  }

  return prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      planId: data.planId,
      isActive: data.status === "ACTIVE",
    },
    include: {
      plan: true,
      createdBy: {
        select: {
          id: true,
          name: true,
           email: true,
        },
      },
    },
  });

}

// change tenant password by admin
export const changeTenantAdminPassword = async (
  tenantId: string,
  data: { newPassword: string; confirmPassword: string }
) => {
  const { newPassword, confirmPassword } = data;

  if (!newPassword?.trim() || newPassword.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant || tenant.isDeleted) {
    throw new AppError("Tenant not found", 404);
  }

  const tenantAdmin = await prisma.user.findFirst({
    where: {
      tenantId,
      role: "TENANT_ADMIN",
    },
  });

  if (!tenantAdmin) {
    throw new AppError("Tenant admin not found", 404);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: tenantAdmin.id },
    data: { password: hashedPassword },
  });

  return { message: "Password updated successfully" };
};

export const patchTenant = async (
  tenantId: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    planId: string;
  }>
) => {
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!existingTenant || existingTenant.isDeleted) {
    throw new AppError("Tenant not found", 404);
  }

  if (data.planId) {
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new AppError("Subscription plan not found", 404);
    }
  }

  return prisma.tenant.update({
    where: { id: tenantId },
    data,
    include: {
      plan: true,
    },
  });
};