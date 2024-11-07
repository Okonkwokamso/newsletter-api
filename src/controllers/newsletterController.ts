import { Request, Response } from 'express';
import { z } from "zod";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma from '../config/prismaClient'; 
import { NewsletterSchema, NewsletterInput } from "../schemas/newsletterSchema";
import logger from "../utils/logger";

export const createNewsletter = async (req: Request, res: Response):Promise<any>  => {
  try {
    // Validate the request body against the Zod schema
    const validatedData: NewsletterInput = NewsletterSchema.parse(req.body);

    // Use Prisma to create the newsletter
    const newNewsletter = await prisma.newsletter.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        author: validatedData.author, // Optional field
      },
    });
    
    // Log successful creation
    logger.info(`Newsletter created with ID: ${newNewsletter.id}`)

    return res.status(201).json(newNewsletter);
    
  } catch (error) {
    
    if (error instanceof z.ZodError) {
      
      // Handle validation errors
      logger.error(`Validation error: ${JSON.stringify(error.errors)}`);
     
      return res.status(400).json({ errors: error.errors });
      
    }
    
    // Handle unexpected errors
    logger.error(`Creation failed: ${(error as Error).message}`);
    return res.status(500).json({ error: "An error occurred while creating the newsletter" });
    
  }

};

export const getAllNewsletters = async (req: Request, res: Response): Promise<any> => {

  try {
    // Extract query parameters with defaults
    const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
    const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0
    const sort = req.query.sort === "asc" ? "asc" : "desc"; // Default to descending order

    // Extract filtering parameters
    const author = req.query.author as string | undefined;
    const title = req.query.title as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const filters: any = {};

    if (author) {
      filters.author = author
    }

    if (title) {
      filters.title = title
    }

    if (startDate || endDate) {
      filters.publishedAt = {};
      if (startDate) {
        filters.publishedAt.gte = new Date(startDate); // Greater than or equal to startDate
      }
      if (endDate) {
        filters.publishedAt.lte = new Date(endDate); // Less than or equal to endDate
      }
    }

    // Fetch newsletters with pagination, sorting and filtering
    const newsletters = await prisma.newsletter.findMany({
      where: {
        isActive: true, 
        ...(filters?.title && { title: filters.title }),
        ...(filters?.author && { author: filters.author }),
        ...(filters?.publishedAt && { publishedAt: filters.publishedAt }),
      },
      skip: offset,
      take: limit,
      orderBy: {
        publishedAt: sort, 
      },
    });

    // Fetch the total count of newsletters for pagination metadata
    const totalNewsletters = await prisma.newsletter.count({where: filters});

    console.log(filters);
    

    // Respond with newsletters and pagination metadata
    return res.json({
      data: newsletters,
      meta: {
        total: totalNewsletters,
        limit,
        offset,
        currentPage: Math.ceil(offset / limit) + 1,
        totalPages: Math.ceil(totalNewsletters / limit),
      }
    });
    
  } catch (error) {
    logger.error(`Error from logger: ${(error as Error).message}`);
    console.error("Error fetching newsletters:", error);
    return res.status(500).json({ error: "An error occurred while retrieving newsletters" });
  }
};

export const getNewsletterById = async (req: Request, res: Response):Promise<void> => {
  const { id } = req.params;

  try {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: Number(id) },
    });
    if (!newsletter) {
      res.status(404).json({ error: 'Newsletter not found' });
      return;
    }
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching newsletter' });
  }
};

export const updateNewsletter = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    // Validate incoming update data with Zod schema
    const updateData = NewsletterSchema.partial().parse(req.body);

    // Perform the update operation
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // Log and respond with updated record
    logger.info(`Newsletter with ID ${id} successfully updated.`);
    return res.json(updatedNewsletter);
  } catch (error) {
    // Handle different errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        logger.error(`Newsletter with ID ${id} not found.`);
        return res.status(404).json({ error: "Newsletter not found" });
      }
    } else if (error instanceof z.ZodError) {
      logger.error("Validation error:", error.errors);
      return res.status(400).json({ error: "Invalid data provided", details: error.errors });
    } else {
      logger.error("Error updating newsletter:", error);
      return res.status(500).json({ error: "An error occurred while updating the newsletter" });
    }
  }

};

export const deleteNewsletter = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    // Mark the newsletter as inactive instead of deleting
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: Number(id) },
      data: { isActive: false } as Prisma.NewsletterUpdateInput
    });

    logger.info(`Newsletter with ID ${id} successfully flagged as inactive.`);
    return res.status(200).json({ message: "Newsletter flagged as inactive", newsletter: updatedNewsletter });
  } catch (error) {
    // Handle cases where the record does not exist
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        logger.error(`Newsletter with ID ${id} not found.`);
        return res.status(404).json({ error: "Newsletter not found" });
      }
    }

    logger.error("Error flagging newsletter as inactive:", error);
    return res.status(500).json({ error: "An error occurred while flagging the newsletter as inactive" });
  }
};










