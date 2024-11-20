import { z } from "zod";

export const AdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "co-admin"]).default("admin"),
});

export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type AdminInput = z.infer<typeof AdminSchema>;

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;