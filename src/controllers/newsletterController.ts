import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from "zod";
import { Prisma, PrismaClient } from "@prisma/client";
import prisma from '../config/prismaClient'; 
import { NewsletterSchema, NewsletterInput } from "../schemas/newsletterSchema";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

export const createNewsletter = async (req: Request, res: Response, next: NextFunction):Promise<any>  => {
  try {
    // Validate the request body against the Zod schema
    const validatedData: NewsletterInput = NewsletterSchema.parse(req.body);

    const { title, content } = validatedData;

    const existingNewsletter = await prisma.newsletter.findUnique({
      where: { title }
    });

    if (existingNewsletter) {
      throw new AppError('A newsletter with this title already exists.', 409);
    }
    
    const newNewsletter = await prisma.newsletter.create({
      data: {
        ...validatedData,
        isActive: validatedData.isActive ?? true
      },
    });
    
    // Log successful creation
    logger.info(`Newsletter created with ID: ${newNewsletter.id}`)

    return res.status(201).json({
      success: true,
      data: newNewsletter
    });
    
  } catch (err: any) {
    
    if (err.name === "ZodError") {
      const errorMessage = err.errors.map((e: any) => e.message).join(", ");
      return next(new AppError(`Validation error: ${errorMessage}`, 400));
    }
    
    next(err) // Pass other eerror to the the global error handler
    
  }
};

export const getAllNewsletters = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

  try {
    // Extract query parameters with defaults
    const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
    const offset = parseInt(req.query.offset as string) || 0; // Default offset to 0
    const sort = req.query.sort === "asc" ? "asc" : "desc"; // Default to descending order
    const search = req.query.search as string | undefined;

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
    };

    if (startDate || endDate) {
      filters.publishedAt = {};
      if (startDate) {
        filters.publishedAt.gte = new Date(startDate); // Greater than or equal to startDate
      }
      if (endDate) {
        filters.publishedAt.lte = new Date(endDate); // Less than or equal to endDate
      }
    };

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    };

    // Fetch newsletters with pagination, sorting, filtering and search
    const newsletters = await prisma.newsletter.findMany({
      where: {
        isActive: true, 
        ...filters,
        // ...(filters?.title && { title: filters.title }),
        // ...(filters?.author && { author: filters.author }),
        // ...(filters?.publishedAt && { publishedAt: filters.publishedAt }),
      },
      skip: offset,
      take: limit,
      orderBy: {
        publishedAt: sort, 
      },
    });

    // Fetch the total count of newsletters for pagination metadata
    //const totalNewsletters = await prisma.newsletter.count({where: filters});
    const totalNewsletters = await prisma.newsletter.count({
      where: {
        isActive: true,
        ...filters
      }
    });
    console.log(filters);

    if (!newsletters.length) {
      throw new AppError("No newsletters found with the specified criteria", 404);
    }
    
    // Respond with newsletters and pagination metadata
    return res.json({
      meta: {
        total: totalNewsletters,
        limit,
        offset,
        currentPage: Math.ceil(offset / limit) + 1,
        totalPages: Math.ceil(totalNewsletters / limit),
      },
      data: newsletters
    });
    
  } catch (error) {
    logger.error(`Error fetching newsletters: ${(error as Error).message}`);
    next(error instanceof AppError ? error : new AppError("An unexpected error occurred", 500));
  }
};

export const getNewsletterById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const  id  = req.params.id;
    const newsletterId = Number(id);

    // Fetch newsletter
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });

    if (!newsletter) {
      throw new AppError(`Newsletter with ID ${newsletterId} not found.`, 404);
    }

    res.status(200).json({
      success: true,
      message: "Newsletter retrieved successfully.",
      data: newsletter,
    });
  } catch (error) {
    next(error);
  }
};

const updateNewsletterSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

  try {
    const id = req.params.id;
    const newsletterId = Number(id);

    // Validate the body
    const validatedData = updateNewsletterSchema.parse(req.body);

    // Check if the newsletter exists
    const existingNewsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });

    if (!existingNewsletter) {
      throw new AppError(`Newsletter with ID ${newsletterId} not found.`, 404);
    }

    if (!existingNewsletter.isActive) {
      throw new AppError("Cannot update an inactive newsletter", 400);
    }

    // Update the newsletter
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: newsletterId },
      data: validatedData,
    });

    logger.info(`Newsletter with ID ${newsletterId} updated successfully.`);
    res.status(200).json({
      success: true,
      message: "Newsletter updated successfully.",
      data: updatedNewsletter,
    });
  } catch (error: any) {
    // Handle different errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        next(new AppError("A newsletter with this title already exists.", 400));
      }
    } else if (error.name === "ZodError") {
      const message = error.errors.map((e: any) => e.message).join(", ");
      next(new AppError(`Validation error: ${message}`, 400));
    } else {
      next(error);
    }
  }

};

export const deleteNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id;
    const newsletterId = Number(id);
  
    // Check if the newsletter exists and is active
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
    });
  
    if (!newsletter) {
      throw new AppError(`Newsletter with ID ${newsletterId} not found`, 404);
    }
  
    if (newsletter.isActive === false) {
      throw new AppError(`Newsletter with ID ${newsletterId} is already inactive`, 400);
    }
  
    // Soft delete the newsletter by updating its isActive
    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: { isActive: false },
    });
  
    res.status(200).json({
      message: `Newsletter with ID ${newsletterId} has been successfully marked as inactive`,
    });
  } catch (error) {
    next(error)
  }
};










