import express from "express";
import { createUser, getAllUsers } from "../controllers/userController";
import { verifyJwt } from "../middleware/verifyJwt";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get('/', verifyJwt, getAllUsers)

export default userRouter;
