import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import logger from "../utils/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
}); 