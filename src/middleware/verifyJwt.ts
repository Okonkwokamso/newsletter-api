//import "../types/express";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import logger from "../utils/logger";
import { AppError } from "../utils/AppError";

dotenv.config();

// interface AdminRequest extends Request {
//   admin?: {
//     id: number;
//     email: string;
//   };
// }

interface AdminPayload {
  id: number;
  email: string;
}

export const verifyJwt = (req: Request, res: Response, next: NextFunction): void => {

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.error("Authorization header missing or malformed");
    res.status(401).json({ error: "Unauthorized: Token is missing" });
    return;
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    res.status(401).json({ error: "Token missing or unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AdminPayload;

    res.locals.admin = {
      id: decoded.id,
      email: decoded.email,
    };

    console.log(res.locals.admin);
    
    
    // req.admin = {      
    //   id: decoded.id,
    //   email: decoded.email, 
    // };
    // console.log(req.admin);
    
    logger.info(`Token verified for admin: ${decoded.email}`);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid or expired token", 401));
    } else {
      next(error);
    }
  }
};








