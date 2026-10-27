import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./error.middleware.js";

export type UserRole = "seller" | "buyer" | "admin";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "seller" || value === "buyer" || value === "admin";
}

function readUserClaims(value: unknown): AuthenticatedUser | undefined {
  if (
    !isRecord(value) ||
    typeof value["id"] !== "string" ||
    typeof value["username"] !== "string" ||
    !isUserRole(value["role"])
  ) {
    return undefined;
  }

  return {
    id: value["id"],
    username: value["username"],
    role: value["role"],
  };
}

export const verifyAuth: RequestHandler = (request, _response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new HttpError(401, "Bearer token is required"));
    return;
  }

  const secret = process.env["JWT_SECRET"];

  if (!secret) {
    next(new Error("JWT_SECRET must be configured"));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();
  let decoded: string | jwt.JwtPayload;

  try {
    decoded = jwt.verify(token, secret);
  } catch {
    next(new HttpError(403, "Token is invalid or expired"));
    return;
  }

  const user = readUserClaims(decoded);

  if (!user) {
    next(new HttpError(403, "Token payload is invalid"));
    return;
  }

  request.user = user;
  next();
};

export function requireRoles(...roles: UserRole[]): RequestHandler {
  return (request: Request, _response, next) => {
    if (!request.user) {
      next(new HttpError(401, "Authentication is required"));
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(new HttpError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
}
