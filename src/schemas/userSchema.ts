import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }).min(1, { message: "Email is required" }),
  isSubscribed: z.boolean().default(true)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
