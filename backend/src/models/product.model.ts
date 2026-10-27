import { db } from "../database/prisma.js";

type ProductRow = NonNullable<
  Awaited<ReturnType<typeof db.orm.public.Product.first>>
>;

export interface CreateProductData {
  title: string;
  description: string;
  initialPrice: number;
  currentPrice: number;
  imageUrl: string;
  sellerId: string;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  imageUrl?: string;
}

export class ProductModel {
  static async findById(id: string): Promise<ProductRow | null> {
    return db.orm.public.Product.where({ id }).first();
  }

  static async list(): Promise<ProductRow[]> {
    return db.orm.public.Product.all();
  }

  static async create(data: CreateProductData): Promise<ProductRow> {
    return db.orm.public.Product.create(data);
  }

  static async update(
    id: string,
    data: UpdateProductData,
  ): Promise<ProductRow | null> {
    return db.orm.public.Product.where({ id }).update(data);
  }

  static async delete(id: string): Promise<ProductRow | null> {
    return db.orm.public.Product.where({ id }).delete();
  }
}
