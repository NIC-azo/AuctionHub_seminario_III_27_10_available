import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { requireRoles, verifyAuth } from "../middlewares/auth.middleware.js";
import { uploadProductImage } from "../middlewares/product-image.middleware.js";

const productRouter = Router();

productRouter.get("/", listProducts);
productRouter.get("/:id", getProduct);
productRouter.post(
  "/",
  verifyAuth,
  requireRoles("seller", "admin"),
  uploadProductImage,
  createProduct,
);
productRouter.patch("/:id", verifyAuth, requireRoles("seller", "admin"), updateProduct);
productRouter.delete("/:id", verifyAuth, requireRoles("seller", "admin"), deleteProduct);

export default productRouter;
