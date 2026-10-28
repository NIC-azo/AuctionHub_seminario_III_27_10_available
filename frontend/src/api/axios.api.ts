import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../store/auth.store";
import type { ApiErrorPayload } from "../types/types.bd";

const baseURL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

export class ApiRequestError extends Error {
  public readonly status: number | undefined;
  public readonly details: ApiErrorPayload["details"];
  public readonly code: string | undefined;

  constructor(
    message: string,
    status: number | undefined,
    details: ApiErrorPayload["details"],
    code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

export const api = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      const requestHadToken = Boolean(
        error.config?.headers?.get("Authorization"),
      );
      const authRequest = /\/auth\/(login|register)\/?$/.test(
        error.config?.url ?? "",
      );

      if (error.response?.status === 401 && requestHadToken && !authRequest) {
        useAuthStore.getState().logout();
      }

      return Promise.reject(normalizeApiError(error));
    }

    return Promise.reject(
      new ApiRequestError("Ocurrió un error inesperado.", undefined, undefined),
    );
  },
);

function normalizeApiError(
  error: AxiosError<ApiErrorPayload>,
): ApiRequestError {
  const response = error.response;
  const message =
    response?.data?.error ??
    (error.code === AxiosError.ERR_CANCELED
      ? "La solicitud fue cancelada."
      : error.code === AxiosError.ECONNABORTED
        ? "La solicitud tardó demasiado."
        : error.code === AxiosError.ERR_NETWORK
          ? "No se pudo conectar con AuctionHub. Comprueba que el backend esté activo."
          : "No se pudo completar la solicitud.");

  return new ApiRequestError(
    message,
    response?.status,
    response?.data?.details,
    error.code,
  );
}
