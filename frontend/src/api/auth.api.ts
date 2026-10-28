import { request } from "./request.config";
import type {
  ApiResponse,
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "../types/types.bd";

export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await request<ApiResponse<AuthResponse>, LoginInput>(
    "POST",
    "/auth/login",
    input,
  );
  return response.data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await request<ApiResponse<AuthResponse>, RegisterInput>(
    "POST",
    "/auth/register",
    input,
  );
  return response.data;
}
