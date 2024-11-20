import { z } from "zod";

export const NewsletterSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  content: z.string().min(10, "Content is too short"),
  author: z.string().optional(), 
  isActive: z.boolean().optional(),
});

export type NewsletterInput = z.infer<typeof NewsletterSchema>; 
