import express from "express";
import { createUser, getAllUsers, updateSubscription } from "../controllers/userController";
import { verifyJwt } from "../middleware/verifyJwt";
import { validateId } from "../middleware/validateId";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get('/', verifyJwt, getAllUsers)
userRouter.patch("/:id/subscription", validateId, updateSubscription);

export default userRouter;
