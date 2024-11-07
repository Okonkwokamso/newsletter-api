import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = (schema: ZodSchema<any>, target: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((err) => ({
            path: err.path,
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};