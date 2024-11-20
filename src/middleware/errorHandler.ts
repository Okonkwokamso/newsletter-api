import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Something went wrong.";

  // Log full error details to the console
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  // Send a simplified response to the client
  res.status(statusCode).json({
    success: false,
    message,
  });
};




















































// import { NextFunction, Request, Response } from "express";
// import { ZodError } from "zod"; 
// import logger from "../utils/logger";

// export const errorHandler = (
//   error: any,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // Detailed logging
//   logger.error("Error encountered:", {
//     method: req.method,
//     url: req.url,
//     body: req.body,
//     params: req.params,
//     query: req.query,
//     error: {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//     },
//   });

//   if (error instanceof ZodError) {
//     return res.status(400).json({
//       error: "Validation error",
//       details: error.errors.map((err) => ({
//         path: err.path,
//         message: err.message
//       }))
//     });
//   }

//   if (error.code === "P2025") {
//     return res.status(404).json({ error: "Record not found" });
//   }

//   return res.status(500).json({ error: "Internal server error" });
// };
