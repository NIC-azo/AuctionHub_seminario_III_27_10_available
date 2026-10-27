import type { RequestHandler } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../middlewares/error.middleware.js";
import { ProductModel } from "../models/product.model.js";

const idSchema = z.string().uuid();

const createProductSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(5000),
  initialPrice: z.number().finite().positive(),
  imageUrl: z.string().trim().url().max(2048),
}).strict();

const updateProductSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  imageUrl: z.string().trim().url().max(2048).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field must be provided",
});

export const listProducts: RequestHandler = asyncHandler(async (_request, response) => {
  response.status(200).json({ success: true, data: await ProductModel.list() });
});

export const getProduct: RequestHandler = asyncHandler(async (request, response) => {
  const id = idSchema.parse(request.params["id"]);
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  response.status(200).json({ success: true, data: product });
});

export const createProduct: RequestHandler = asyncHandler(async (request, response) => {
  const seller = request.user;
  if (!seller) {
    throw new HttpError(401, "Authentication is required");
  }

  const input = createProductSchema.parse(request.body);
  const product = await ProductModel.create({
    ...input,
    currentPrice: input.initialPrice,
    sellerId: seller.id,
  });

  response.status(201).json({ success: true, data: product });
});

export const updateProduct: RequestHandler = asyncHandler(async (request, response) => {
  const id = idSchema.parse(request.params["id"]);
  const actor = request.user;
  if (!actor) {
    throw new HttpError(401, "Authentication is required");
  }

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }
  if (actor.role !== "admin" && actor.id !== product.sellerId) {
    throw new HttpError(403, "You cannot update this product");
  }
  if (product.status !== "available") {
    throw new HttpError(409, "Only available products can be updated");
  }

  const input = updateProductSchema.parse(request.body);
  const updated = await ProductModel.update(id, {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
  });
  if (!updated) {
    throw new HttpError(404, "Product not found");
  }

  response.status(200).json({ success: true, data: updated });
});

export const deleteProduct: RequestHandler = asyncHandler(async (request, response) => {
  const id = idSchema.parse(request.params["id"]);
  const actor = request.user;
  if (!actor) {
    throw new HttpError(401, "Authentication is required");
  }

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }
  if (actor.role !== "admin" && actor.id !== product.sellerId) {
    throw new HttpError(403, "You cannot delete this product");
  }
  if (product.status !== "available") {
    throw new HttpError(409, "Sold products cannot be deleted");
  }

  await ProductModel.delete(id);
  response.status(204).end();
});
