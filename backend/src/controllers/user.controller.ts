import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../middlewares/error.middleware.js";
import { toPublicUser, UserModel } from "../models/user.model.js";

const idSchema = z.string().uuid();

const updateUserSchema = z.object({
  username: z.string().trim().min(3).max(40).regex(/^[\w.-]+$/).optional(),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()).optional(),
  password: z.string().min(8).refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must not exceed 72 UTF-8 bytes",
  ).optional(),
  role: z.enum(["buyer", "seller", "admin"]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field must be provided",
});

export const listUsers: RequestHandler = asyncHandler(async (_request, response) => {
  response.status(200).json({ success: true, data: await UserModel.list() });
});

export const getUser: RequestHandler = asyncHandler(async (request, response) => {
  const id = idSchema.parse(request.params["id"]);
  const user = await UserModel.findById(id);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  response.status(200).json({ success: true, data: toPublicUser(user) });
});

export const updateUser: RequestHandler = asyncHandler(async (request, response) => {
  const id = idSchema.parse(request.params["id"]);
  const actor = request.user;
  if (!actor || (actor.id !== id && actor.role !== "admin")) {
    throw new HttpError(403, "You cannot update this user");
  }

  const input = updateUserSchema.parse(request.body);
  if (actor.role !== "admin" && input.role !== undefined) {
    throw new HttpError(403, "Only administrators can change user roles");
  }

  if (input.email) {
    const existing = await UserModel.findByEmail(input.email);
    if (existing && existing.id !== id) {
      throw new HttpError(409, "Email is already registered");
    }
  }
  if (input.username) {
    const existing = await UserModel.findByUsername(input.username);
    if (existing && existing.id !== id) {
      throw new HttpError(409, "Username is already taken");
    }
  }

  const updated = await UserModel.update(id, {
    ...(input.username !== undefined ? { username: input.username } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.password !== undefined
      ? { password: await bcrypt.hash(input.password, 12) }
      : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
  });
  if (!updated) {
    throw new HttpError(404, "User not found");
  }

  response.status(200).json({ success: true, data: toPublicUser(updated) });
});

export const deleteUser: RequestHandler = asyncHandler(async (request, response) => {
  const id = idSchema.parse(request.params["id"]);
  const actor = request.user;
  if (!actor || (actor.id !== id && actor.role !== "admin")) {
    throw new HttpError(403, "You cannot delete this user");
  }

  const deleted = await UserModel.delete(id);
  if (!deleted) {
    throw new HttpError(404, "User not found");
  }

  response.status(204).end();
});
