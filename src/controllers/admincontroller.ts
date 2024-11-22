import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient";
import { AdminInput, AdminSchema, AdminLoginInput, AdminLoginSchema } from "../schemas/adminSchema";
import logger from "../utils/logger";
import { sendEmail } from "../utils/emailService";
import { AppError } from "../utils/AppError";

export const registerAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate input using Zod
    const validatedData: AdminInput = AdminSchema.parse(req.body);

    // Hash the password
    const saltRounds = 10; // Number of salt rounds
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

    // Save the admin to the database with the hashed password
    const newAdmin = await prisma.admin.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    logger.info(`Admin registered: ${newAdmin.username}`);
    return res.status(201).json({ message: "Admin registered successfully", admin: newAdmin });
  } catch (error) {
    logger.error("Error registering admin:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      
    } else if (error instanceof ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    
    return res.status(500).json({ error: "An error occurred during registration" });
  }
};


export const loginAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate the input
    const validatedData: AdminLoginInput = AdminLoginSchema.parse(req.body);

    // Check if admin exists in the database
    const admin = await prisma.admin.findUnique({
      where: { email: validatedData.email },
    });

    if (!admin) {
      logger.warn(`Login failed: Admin with email ${validatedData.email} not found.`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(validatedData.password, admin.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Incorrect password for email ${validatedData.email}.`);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email }, // Payload
      process.env.JWT_SECRET as string, // Secret key
      { expiresIn: "240h" } // Token expiration
    );

    logger.info(`Admin logged in: ${admin.username}`);
    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error("Database error:", error);
      return res.status(500).json({ error: "An error occurred" });
    } else if (error instanceof ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }

    logger.error("Unexpected error during login:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
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


export const sendNewsletter = async (next: NextFunction) => {
    try {
      // Fetch all subscribed users
      const subscribedUsers = await prisma.user.findMany({
        where: { isSubscribed: true },
      });

      if (subscribedUsers.length === 0) {
        console.log("No subscribed users found.");
        return;
      }

      // Send the newsletter to each user
      const newsletterTitle = "Latest Updates from Our Newsletter!";
      const newsletterLink = `${process.env.BASE_URL}/newsletter/123`;

      for (const user of subscribedUsers) {
        await sendEmail({
          to: user.email, 
          subject: "Your Latest Newsletter", 
          templateFileName: "newsletter", 
          replacements: {
            username: "Valued User",
            newsletterLink,
            newsletterTitle,
            unsubscribeLink: `${process.env.BASE_URL}/user/${user.id}/unsubscribe`,
        }});
      }

      console.log("Newsletter sent to all subscribed users.");
    } catch (error: any) {
      if (error.code === "P2025") {
        // Handle case when user not found
        return next(new AppError("User not found.", 404));
      }
      next(error);
    }
};




