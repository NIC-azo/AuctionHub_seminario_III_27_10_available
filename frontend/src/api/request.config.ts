import type { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { api } from "./axios.api";

export async function request<TResponse, TBody = unknown>(
  method: Method,
  url: string,
  data?: TBody,
  config?: Omit<AxiosRequestConfig<TBody>, "method" | "url" | "data">,
): Promise<TResponse> {
  const response = await api.request<
    TResponse,
    AxiosResponse<TResponse>,
    TBody
  >({
    ...config,
    method,
    url,
    ...(data === undefined ? {} : { data }),
  });

  return response.data;
}
