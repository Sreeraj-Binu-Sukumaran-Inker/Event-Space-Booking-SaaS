import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AppError } from "../utils/AppError";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";

export class AuthController {

  // 🔐 Register Tenant (If you still allow it)
  static async registerTenant(
    req: Request,
    res: Response
  ): Promise<void> {

    const result = await AuthService.registerTenantWithAdmin(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenant: result.tenant,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          tenantId: result.user.tenantId,
        },
        accessToken: result.accessToken,
      },
    });
  }

  // 🔐 Login
  static async login(
    req: Request,
    res: Response
  ): Promise<void> {

    const { user, accessToken, refreshToken } =
      await AuthService.login(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
        email: user.email,
        tenantDomain: (user as any).tenant?.customDomain || null,
      },
    });
  }

  // 🔄 Refresh Access Token
  static async refresh(
    req: Request,
    res: Response
  ): Promise<void> {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token provided", 401);
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const accessSecret = process.env.JWT_SECRET;
    if (!refreshSecret || !accessSecret) {
      throw new AppError("JWT secrets are not configured", 500);
    }

    let decoded: { id: string };

    try {
      decoded = jwt.verify(
        refreshToken,
        refreshSecret
      ) as { id: string };
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
      },
      accessSecret,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
        email: user.email,
      },
    });
  }

  // 🚪 Logout
  static async logout(
    req: Request,
    res: Response
  ): Promise<void> {

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
}
