import { request } from "./request.config";
import type { ApiResponse, User } from "../types/types.bd";

export async function getUser(id: string): Promise<User> {
  const response = await request<ApiResponse<User>>(
    "GET",
    `/users/${encodeURIComponent(id)}`,
  );
  return response.data;
}
