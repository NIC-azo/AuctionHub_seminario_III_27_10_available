import multer from "multer";
import type { RequestHandler } from "express";
import { HttpError } from "./error.middleware.js";

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const parseProductImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    if (!imageMimeTypes.has(file.mimetype)) {
      callback(new HttpError(415, "Image must be JPEG, PNG, or WebP"));
      return;
    }

    callback(null, true);
  },
}).single("image");

export const uploadProductImage: RequestHandler = (request, response, next) => {
  parseProductImage(request, response, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new HttpError(413, "Image must not exceed 5 MB"));
        return;
      }

      next(new HttpError(400, "Invalid image upload"));
      return;
    }

    next(error);
  });
};
