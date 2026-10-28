import type { RequestHandler } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../middlewares/error.middleware.js";
import { MinioService } from "../services/minio.service.js";
import { ProductModel } from "../models/product.model.js";

const idSchema = z.string().uuid();

function hasValidImageSignature(file: Express.Multer.File): boolean {
  if (file.mimetype === "image/png") {
    return file.buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  }

  if (file.mimetype === "image/jpeg") {
    return file.buffer[0] === 0xff
      && file.buffer[1] === 0xd8
      && file.buffer[2] === 0xff;
  }

  if (file.mimetype === "image/webp") {
    return file.buffer.toString("ascii", 0, 4) === "RIFF"
      && file.buffer.toString("ascii", 8, 12) === "WEBP";
  }

  return false;
}

const createProductSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(5000),
  initialPrice: z.coerce.number().finite().positive(),
  imageUrl: z.string().trim().url().max(2048).optional(),
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
  if (request.file && !hasValidImageSignature(request.file)) {
    throw new HttpError(415, "Uploaded file content is not a valid supported image");
  }

  if (Boolean(request.file) === Boolean(input.imageUrl)) {
    throw new HttpError(400, "Provide exactly one image file or imageUrl");
  }

  const imageUrl = request.file
    ? await MinioService.uploadFile(request.file)
    : input.imageUrl;

  if (!imageUrl) {
    throw new HttpError(400, "A product image is required");
  }

  const product = await ProductModel.create({
    ...input,
    imageUrl,
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
