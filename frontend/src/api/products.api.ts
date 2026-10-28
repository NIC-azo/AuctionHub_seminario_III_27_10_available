import { request } from "./request.config";
import type {
  ApiResponse,
  CreateProductInput,
  Product,
} from "../types/types.bd";

export async function listProducts(): Promise<Product[]> {
  const response = await request<ApiResponse<Product[]>>("GET", "/products");
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await request<ApiResponse<Product>>(
    "GET",
    `/products/${encodeURIComponent(id)}`,
  );
  return response.data;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const body = new FormData();
  body.append("title", input.title);
  body.append("description", input.description);
  body.append("initialPrice", String(input.initialPrice));
  body.append("image", input.image);

  const response = await request<ApiResponse<Product>, FormData>(
    "POST",
    "/products",
    body,
  );
  return response.data;
}
