export type UserRole = "buyer" | "seller" | "admin";
export type ProductStatus = "available" | "sold" | string;

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  initialPrice: number;
  currentPrice: number;
  imageUrl: string;
  status: ProductStatus;
  sellerId: string;
  winnerId: string | null;
  createdAt: string;
}

export interface Bid {
  id: string;
  amount: number;
  productId: string;
  userId: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorPayload {
  success: false;
  error: string;
  details?: Array<{
    code: string;
    message: string;
    path: Array<string | number>;
  }>;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role: Extract<UserRole, "buyer" | "seller">;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  initialPrice: number;
  image: File;
}
