import bcrypt from "bcrypt";
import { User, Role, Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

interface RegisterTenantDTO {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  static async registerTenantWithAdmin(data: RegisterTenantDTO): Promise<{ tenant: Prisma.TenantGetPayload<{ include: { users: true } }>; user: User; accessToken: string; refreshToken: string }> {
    const { companyName, adminName, email, password } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const tenantCreateData: Prisma.TenantCreateInput = {
      name: companyName,
      email: null,
      phone: null,
      plan: undefined, // if optional
      users: {
        create: {
          name: adminName,
          email,
          password: hashedPassword,
          role: Role.TENANT_ADMIN,
        },
      },
    };
    
    const tenant = (await prisma.tenant.create({
      data: tenantCreateData,
      include: {
        users: true,
      },
    })) as Prisma.TenantGetPayload<{ include: { users: true } }>;

    const adminUser = tenant.users[0];

    if (!adminUser) {
      throw new AppError("Admin user creation failed", 500);
    }

    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new AppError("JWT secrets are not configured", 500);
    }

    const accessToken = jwt.sign(
      {
        id: adminUser.id,
        role: adminUser.role,
        tenantId: adminUser.tenantId,
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: adminUser.id },
      jwtRefreshSecret,
      { expiresIn: "7d" }
    );

    return {
      tenant,
      user: adminUser,
      accessToken,
      refreshToken,
    };
  }

  static async login(data: LoginDTO): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch: boolean = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new AppError("JWT secrets are not configured", 500);
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      jwtRefreshSecret,
      { expiresIn: "7d" }
    );

  return {
    user,
    accessToken,
    refreshToken,
    };
    
  }
}
