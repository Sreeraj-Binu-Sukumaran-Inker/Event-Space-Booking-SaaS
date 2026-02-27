import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";

interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  tenantId: string;
  phone?: string;
  avatarUrl?: string;
}

interface UpdateStaffInput {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

/**
 * GET ALL STAFF FOR A TENANT
 */
export const getStaff = async (tenantId: string) => {
  return prisma.user.findMany({
    where: {
      tenantId,
      role: "STAFF",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * GET STAFF BY ID
 */
export const getStaffById = async (staffId: string, tenantId: string) => {
  const staff = await prisma.user.findFirst({
    where: {
      id: staffId,
      tenantId,
      role: "STAFF",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!staff) {
    throw new AppError("Staff member not found", 404);
  }

  return staff;
};

/**
 * CREATE STAFF (with plan limit check)
 */
export const createStaff = async (data: CreateStaffInput) => {
  const { name, email, password, tenantId, phone, avatarUrl } = data;

  if (!name?.trim()) throw new AppError("Name is required", 400);
  if (!email?.trim()) throw new AppError("Email is required", 400);
  if (!password?.trim() || password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  // Get tenant with plan
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });

  if (!tenant || tenant.isDeleted) {
    throw new AppError("Tenant not found", 404);
  }

  if (!tenant.isActive) {
    throw new AppError("Tenant account is suspended", 403);
  }

  // Check plan staff limit
  if (tenant.plan) {
    const currentStaffCount = await prisma.user.count({
      where: {
        tenantId,
        role: "STAFF",
      },
    });

    if (currentStaffCount >= tenant.plan.staffLimit) {
      const superAdmins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });

      if (superAdmins.length > 0) {
        await prisma.notification.createMany({
          data: superAdmins.map((admin) => ({
            userId: admin.id,
            title: "Tenant Exceeded Staff Limit",
            message: `Tenant "${tenant.name}" attempted to create more staff than allowed by plan.`,
            type: "WARNING",
          })),
        });
      }

      throw new AppError(
        `Staff limit reached. Your plan allows a maximum of ${tenant.plan.staffLimit} staff members.`,
        403
      );
    }
  }

  // Check email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "STAFF",
      tenantId,
      phone,
      avatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
};

/**
 * UPDATE STAFF
 */
export const updateStaff = async (
  staffId: string,
  tenantId: string,
  data: UpdateStaffInput
) => {
  const existing = await prisma.user.findFirst({
    where: {
      id: staffId,
      tenantId,
      role: "STAFF",
    },
  });

  if (!existing) {
    throw new AppError("Staff member not found", 404);
  }

  if (data.email) {
    const emailInUse = await prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: staffId },
      },
    });

    if (emailInUse) {
      throw new AppError("Email already in use", 409);
    }
  }

  return prisma.user.update({
    where: { id: staffId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
};

/**
 * DELETE STAFF
 */
export const deleteStaff = async (staffId: string, tenantId: string) => {
  const existing = await prisma.user.findFirst({
    where: {
      id: staffId,
      tenantId,
      role: "STAFF",
    },
  });

  if (!existing) {
    throw new AppError("Staff member not found", 404);
  }

  await prisma.user.delete({ where: { id: staffId } });
  return { message: "Staff member deleted successfully" };
};

/**
 * RESET STAFF PASSWORD
 */
export const resetStaffPassword = async (
  staffId: string,
  tenantId: string,
  data: { newPassword: string }
) => {
  const { newPassword } = data;

  if (!newPassword?.trim() || newPassword.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const existing = await prisma.user.findFirst({
    where: {
      id: staffId,
      tenantId,
      role: "STAFF",
    },
  });

  if (!existing) {
    throw new AppError("Staff member not found", 404);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: staffId },
    data: { password: hashedPassword },
  });

  return { message: "Password reset successfully" };
};

/**
 * GET STAFF COUNT
 */
export const getStaffCount = async (tenantId: string) => {
  return prisma.user.count({
    where: {
      tenantId,
      role: "STAFF",
    },
  });
};
