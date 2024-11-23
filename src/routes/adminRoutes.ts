import { Router } from "express";
import { registerAdmin, loginAdmin, getAllUsers } from "../controllers/admincontroller";
import { verifyJwt } from "../middleware/verifyJwt";
import { validateRequest } from "../middleware/validateRequest";

const adminRouter = Router();

adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.get('/', verifyJwt, getAllUsers)
//adminRouter.post('/notifyusers', sendNewsletterEmail)


export default adminRouter;


