import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return next(new AppError("Invalid newsletter ID. ID must be a number.", 400));
  }

  req.params.id = parsedId.toString(); // Replace with parsed ID
  next();
};
