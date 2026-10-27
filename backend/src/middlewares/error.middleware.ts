import type {
  ErrorRequestHandler,
  RequestHandler,
} from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const asyncHandler = (handler: RequestHandler): RequestHandler =>
  (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: "Invalid request data",
      details: error.issues.map(({ code, message, path }) => ({
        code,
        message,
        path,
      })),
    });
    return;
  }

  console.error("Unhandled request error:", error);
  response.status(500).json({
    success: false,
    error: "Internal server error",
  });
};
