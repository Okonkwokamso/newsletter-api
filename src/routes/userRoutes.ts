import express from "express";
import { createUser, updateSubscription } from "../controllers/userController";
import { validateId } from "../middleware/validateId";

const userRouter = express.Router();

userRouter.post("/", createUser);

userRouter.patch("/:id/subscription", validateId, updateSubscription);

export default userRouter;
