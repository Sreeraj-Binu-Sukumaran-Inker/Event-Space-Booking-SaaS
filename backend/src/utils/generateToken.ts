import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

interface TokenPayload {
  id: string;
  role: Role;
  tenantId: string | null;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "1d",
  });
};
