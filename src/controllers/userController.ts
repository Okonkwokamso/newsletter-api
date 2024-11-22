import { Request, Response, NextFunction } from "express";
import { createUserSchema, subscriptionSchema } from "../schemas/userSchema";
import prisma from "../config/prismaClient";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";
import { sendEmail } from "../utils/emailService";

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

export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { isSubscribed } = subscriptionSchema.parse(req.body);

    // Validate the input
    if (typeof isSubscribed !== "boolean") {
      throw new AppError("Invalid value for 'isSubscribed'. Must be true or false.", 400);
    }

    // Update the subscription status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isSubscribed },
    });

    // Send email to user about their updated subscription status
    const emailSubject = isSubscribed ? "You've Subscribed to Our Newsletter!" : "You've Unsubscribed from Our Newsletter";

    const templateFileName = isSubscribed ? "subscribe.html" : "unsubscribe.html";

    await sendEmail({
      to: updatedUser.email, 
      subject: emailSubject, 
      templateFileName: templateFileName, 
      replacements: {
        username: "Valued User",
        unsubscribeLink: `${process.env.BASE_URL}/user/${userId}/unsubscribe`,
    }}); 

    res.status(200).json({
      message: `User has been ${isSubscribed ? "subscribed" : "unsubscribed"} successfully.`,
      data: updatedUser,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      // Handle case when user not found
      return next(new AppError("User not found.", 404));
    }
    next(error);
  }
};


