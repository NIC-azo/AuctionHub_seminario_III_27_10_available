import { db } from "../database/prisma.js";
import { HttpError } from "../middlewares/error.middleware.js";

type BidRow = NonNullable<Awaited<ReturnType<typeof db.orm.public.Bid.first>>>;

export interface BidWithUser {
  id: string;
  amount: number;
  productId: string;
  userId: string;
  createdAt: unknown;
  user?: {
    id: string;
    username: string;
  } | undefined;
}

export class BidModel {
  static async createBid(
    productId: string,
    userId: string,
    amount: number,
  ): Promise<BidRow> {
    return await db.transaction(async (tx) => {
      const product = await tx.orm.public.Product.where({ id: productId })
        .forUpdate()
        .first();

      if (!product) {
        throw new HttpError(404, "Product not found");
      }

      if (product.status !== "available") {
        throw new HttpError(409, "Product is not available for bidding");
      }

      if (product.sellerId === userId) {
        throw new HttpError(403, "Sellers cannot place bids on their own products");
      }

      const minRequired = product.currentPrice > 0
        ? product.currentPrice
        : product.initialPrice;

      if (amount <= minRequired) {
        throw new HttpError(
          400,
          `Bid amount must be strictly greater than the current price ($${minRequired})`,
        );
      }

      const bid = await tx.orm.public.Bid.create({
        amount,
        productId,
        userId,
      });

      await tx.orm.public.Product.where({ id: productId }).update({
        currentPrice: amount,
      });

      return bid;
    });
  }

  static async buyProduct(productId: string, userId: string) {
    return await db.transaction(async (tx) => {
      const product = await tx.orm.public.Product.where({ id: productId })
        .forUpdate()
        .first();

      if (!product) {
        throw new HttpError(404, "Product not found");
      }

      if (product.status !== "available") {
        throw new HttpError(409, "Product is already sold or unavailable");
      }

      if (product.sellerId === userId) {
        throw new HttpError(403, "Sellers cannot purchase their own products");
      }

      const finalPrice = product.currentPrice > 0
        ? product.currentPrice
        : product.initialPrice;

      const updated = await tx.orm.public.Product.where({ id: productId }).update({
        status: "sold",
        winnerId: userId,
        currentPrice: finalPrice,
      });

      return updated;
    });
  }

  static async listByProduct(productId: string): Promise<BidWithUser[]> {
    const bids = await db.orm.public.Bid.where({ productId })
      .include("user")
      .all();

    return bids
      .map((b) => ({
        id: b.id,
        amount: b.amount,
        productId: b.productId,
        userId: b.userId,
        createdAt: b.createdAt,
        user: b.user
          ? {
            id: b.user.id,
            username: b.user.username,
          }
          : undefined,
      }))
      .sort((a, b) =>
        new Date(String(b.createdAt)).getTime() -
        new Date(String(a.createdAt)).getTime()
      );
  }
}
