import { z } from "zod";

// Valid notification types — adding a new template means adding it here too
export const notificationTypeSchema = z.enum([
    "welcome",
    "password_reset",
    "order_confirmation",
    "low_stock_alert",
    "custom",
]);

// Schema for POST /notifications body
export const createNotificationSchema = z.object({
    type: notificationTypeSchema,
    to: z.string().email("Must be a valid email address"),
    data: z.record(z.unknown()).default({}),
});

// Schema for POST /notifications/:id/retry — no body needed but kept for consistency
export const retrySchema = z.object({});

// Schema for GET /notifications query params
export const listQuerySchema = z.object({
    status: z.enum(["pending", "sent", "failed"]).optional(),
    to: z.string().email().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});