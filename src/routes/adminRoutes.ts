import { Router } from "express";
import { registerAdmin, loginAdmin, sendNewsletter, getAllUsers } from "../controllers/admincontroller";
import { verifyJwt } from "../middleware/verifyJwt";
import { validateRequest } from "../middleware/validateRequest";

const adminRouter = Router();

adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.get('/', verifyJwt, getAllUsers)
adminRouter.post('/sendnewsletter', sendNewsletter)


export default adminRouter;


// import express from "express";
// import { registerAdmin, loginAdmin } from "../controllers/adminController"; // Ensure these controllers are implemented
// import { validateRequest } from "../middlewares/validateRequest"; // Middleware for schema validation
// import { authenticateAdmin } from "../middlewares/authenticateAdmin"; // Middleware for admin authentication
// import { AdminSchema, AdminLoginSchema } from "../schemas/adminSchema"; // Validation schemas

// const adminRouter = express.Router();

// // Admin Registration
// adminRouter.post(
//   "/register",
//   validateRequest(AdminSchema), // Validate request body using Zod schema
//   registerAdmin // Controller function for admin registration
// );

// // Admin Login
// adminRouter.post(
//   "/login",
//   validateRequest(AdminLoginSchema), // Validate login request body
//   loginAdmin // Controller function for admin login
// );

// // Protected Route Example (Admin-only access)
// adminRouter.get(
//   "/profile",
//   authenticateAdmin, // Middleware to authenticate admin before proceeding
//   (req, res) => {
//     res.json({ message: "Welcome, Admin!" });
//   }
// );

// export default adminRouter;
