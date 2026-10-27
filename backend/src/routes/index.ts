import { Router, type Router as ExpressRouter } from "express";
import authRouter from "./auth.routes.js";
import productRouter from "./product.routes.js";
import userRouter from "./user.routes.js";

const rootRouter: ExpressRouter = Router();

rootRouter.get("/", (_request, response) => {
  response.json({ name: "AuctionHub API", status: "ok" });
});
rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/products", productRouter);

export default rootRouter;
