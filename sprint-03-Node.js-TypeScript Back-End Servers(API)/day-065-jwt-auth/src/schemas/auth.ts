import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .min(2, "name must be at least 2 characters")
    .trim(),

  email: z
    .string({ required_error: "email is required" })
    .email("must be a valid email")
    .toLowerCase(),

  password: z
    .string({ required_error: "password is required" })
    .min(6, "password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  email:    z.string({ required_error: "email is required" }).email().toLowerCase(),
  password: z.string({ required_error: "password is required" }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput    = z.infer<typeof LoginSchema>;