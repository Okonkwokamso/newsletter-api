import { Request, Response, NextFunction } from "express";
import { createUserSchema } from "../schemas/userSchema";
import prisma from "../config/prismaClient";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate user data
    const validatedUser = createUserSchema.parse(req.body);

    if (!validatedUser.email) {
      throw new AppError("Email is required", 400);
      
    }

    const userData = {
      ...validatedUser,
      isSubscribed: validatedUser.isSubscribed ?? true,
    };

    // Save to the database
    const user = await prisma.user.create({
      data: userData,
    });

    res.status(201).json({
      message: "User successfully created",
      data: user,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return next(
        new AppError(
          "Validation error",
          400,
          err.errors.map((e: any) => e.message).join(", ") // Collect all Zod error messages
        )
      );
    } else if ((err as any).code === "P2002") {
      return next(new AppError("Email already exists", 409));
    }

    next(err);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isSubscribed: true,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!users.length) {
      throw new AppError("No subscribed users found", 404);
      
    }

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error(`Error fetching users: ${(error as Error).message}`);
    next(error);
  }
};