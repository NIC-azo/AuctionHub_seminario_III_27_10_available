import { Router } from "express";
import {
  listProductBids,
  placeBid,
  purchaseProduct,
} from "../controllers/bid.controller.js";
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

// Rutas de subasta, pujas y compra directa
productRouter.get("/:id/bids", listProductBids);
productRouter.post("/:id/bids", verifyAuth, placeBid);
productRouter.post("/:id/buy", verifyAuth, purchaseProduct);

export default productRouter;
