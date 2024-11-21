import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }).min(1, { message: "Email is required" }),
  isSubscribed: z.boolean().default(true)
});

export const subscriptionSchema = z.object({
  isSubscribed: z.boolean({
    required_error: "'isSubscribed' is required and must be a boolean",
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
