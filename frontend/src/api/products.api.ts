import { request } from "./request.config";
import type {
  ApiResponse,
  Bid,
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

export async function listProductBids(productId: string): Promise<Bid[]> {
  const response = await request<ApiResponse<Bid[]>>(
    "GET",
    `/products/${encodeURIComponent(productId)}/bids`,
  );
  return response.data;
}

export async function placeBid(
  productId: string,
  amount: number,
): Promise<Bid> {
  const response = await request<ApiResponse<Bid>, { amount: number }>(
    "POST",
    `/products/${encodeURIComponent(productId)}/bids`,
    { amount },
  );
  return response.data;
}

export async function buyProduct(productId: string): Promise<Product> {
  const response = await request<ApiResponse<Product>>(
    "POST",
    `/products/${encodeURIComponent(productId)}/buy`,
  );
  return response.data;
}
