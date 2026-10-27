import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { asyncHandler, HttpError } from "../middlewares/error.middleware.js";
import { toPublicUser, UserModel } from "../models/user.model.js";

const credentialsSchema = z.object({
  username: z.string().trim().min(3).max(40).regex(/^[\w.-]+$/),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8).refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must not exceed 72 UTF-8 bytes",
  ),
  role: z.enum(["buyer", "seller"]).default("buyer"),
}).strict();

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1).refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must not exceed 72 UTF-8 bytes",
  ),
}).strict();

function signToken(user: {
  id: string;
  username: string;
  role: string;
}): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    throw new Error("JWT_SECRET must be configured");
  }

  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    secret,
    { expiresIn: "1h" },
  );
}

export const register: RequestHandler = asyncHandler(async (request, response) => {
  const input = credentialsSchema.parse(request.body);
  const existingUser = await UserModel.findByEmail(input.email);
  if (existingUser) {
    throw new HttpError(409, "Email is already registered");
  }

  const existingUsername = await UserModel.findByUsername(input.username);
  if (existingUsername) {
    throw new HttpError(409, "Username is already taken");
  }

  const password = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({
    username: input.username,
    email: input.email,
    password,
    role: input.role,
  });

  response.status(201).json({
    success: true,
    data: { user: toPublicUser(user), token: signToken(user) },
  });
});

export const login: RequestHandler = asyncHandler(async (request, response) => {
  const input = loginSchema.parse(request.body);
  const user = await UserModel.findByEmail(input.email);

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new HttpError(401, "Invalid email or password");
  }

  response.status(200).json({
    success: true,
    data: { user: toPublicUser(user), token: signToken(user) },
  });
});
