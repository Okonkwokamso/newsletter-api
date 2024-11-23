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





// export const updateSubscription = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//   try {
//     const userId = parseInt(req.params.id, 10);
//     const { isSubscribed } = subscriptionSchema.parse(req.body);

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Validate the input
//     if (typeof isSubscribed !== "boolean") {
//       throw new AppError("Invalid value for 'isSubscribed'. Must be true or false.", 400);
//     }

//     // Step 2: Toggle subscription status
//     const newStatus = !user.isSubscribed;

//     // Update the subscription status
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: { isSubscribed: newStatus },
//     });

//     // Send email to user about their updated subscription status
//     const templateName = isSubscribed ? "subscribe" : "unsubscribe";
//     const subject = isSubscribed ? "Welcome to Our Newsletter!" : "You've Unsubscribed from Our Newsletter";
//     const link = `${process.env.BASE_URL}/user/${userId}/${newStatus ? "newsletter" : "unsubscribe"}`;
//     console.log(`The LINK:  ${link}`);
    

//     await sendEmail({
//       to: updatedUser.email,
//       subject, 
//       templateName, 
//       templateData: {
//         name: "Valued User",
//         link
//       }
//     }); 

//     res.status(200).json({
//       message: `User has been ${isSubscribed ? "subscribed" : "unsubscribed"} successfully.`,
//       data: updatedUser,
//     });
//   } catch (error: any) {
//     if (error.code === "P2025") {
//       // Handle case when user not found
//       return next(new AppError("User not found.", 404));
//     }
//     next(error);
//   }
// };


