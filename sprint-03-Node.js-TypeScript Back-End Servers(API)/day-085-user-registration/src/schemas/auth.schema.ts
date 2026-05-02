import { z } from "zod";

export const registerSchema = z.object({
    username: z
        .string()
        .min(3,  "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Must be a valid email address"),
    password: z
        .string()
        .min(8,  "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
    email:    z.string().email("Must be a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
    token: z.string().length(64, "Invalid verification token"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Must be a valid email address"),
});

export const resetPasswordSchema = z.object({
    token:    z.string().length(64, "Invalid reset token"),
    password: z
        .string()
        .min(8,  "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export const refreshTokenSchema = z.object({
    refresh_token: z.string().min(1, "Refresh token is required"),
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
        .string()
        .min(8,  "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
}).refine((d) => d.current_password !== d.new_password, {
    message: "New password must differ from current password",
    path: ["new_password"],
});