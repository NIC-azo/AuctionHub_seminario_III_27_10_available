import { Router } from "express";
import {
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { requireRoles, verifyAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.use(verifyAuth);
userRouter.get("/", requireRoles("admin"), listUsers);
userRouter.get("/:id", getUser);
userRouter.patch("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
