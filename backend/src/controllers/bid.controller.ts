import type { RequestHandler } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../middlewares/error.middleware.js";
import { BidModel } from "../models/bid.model.js";

const idSchema = z.string().uuid();

const createBidSchema = z.object({
  amount: z.coerce.number().finite().positive(),
}).strict();

export const placeBid: RequestHandler = asyncHandler(async (request, response) => {
  const actor = request.user;
  if (!actor) {
    throw new HttpError(401, "Authentication is required");
  }

  const productId = idSchema.parse(request.params["id"]);
  const { amount } = createBidSchema.parse(request.body);

  const bid = await BidModel.createBid(productId, actor.id, amount);

  response.status(201).json({
    success: true,
    message: "Bid placed successfully",
    data: bid,
  });
});

export const purchaseProduct: RequestHandler = asyncHandler(async (request, response) => {
  const actor = request.user;
  if (!actor) {
    throw new HttpError(401, "Authentication is required");
  }

  const productId = idSchema.parse(request.params["id"]);
  const product = await BidModel.buyProduct(productId, actor.id);

  response.status(200).json({
    success: true,
    message: "Product purchased successfully",
    data: product,
  });
});

export const listProductBids: RequestHandler = asyncHandler(async (request, response) => {
  const productId = idSchema.parse(request.params["id"]);
  const bids = await BidModel.listByProduct(productId);

  response.status(200).json({
    success: true,
    data: bids,
  });
});

