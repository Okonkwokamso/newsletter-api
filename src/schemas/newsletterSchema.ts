import { z } from "zod";

export const NewsletterSchema = z.object({
  title: z.string().min(5, "Title is required"),
  content: z.string().min(15, "Content is required"),
  author: z.string().optional(), 
  isActive: z.boolean(),
});

export type NewsletterInput = z.infer<typeof NewsletterSchema>; 
