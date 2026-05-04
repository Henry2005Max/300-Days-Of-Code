import { z } from "zod";

export const enqueueSchema = z.object({
    type: z.enum(["welcome", "password_reset", "order_confirmation", "low_stock_alert", "payment_received", "custom"]),
    recipient_email:   z.string().email("Must be a valid email address"),
    recipient_webhook: z.string().url().optional(),
    channel:           z.enum(["email", "webhook", "both"]).optional(),
    template_data:     z.record(z.unknown()).default({}),
});

export const listJobsSchema = z.object({
    status: z.enum(["pending", "processing", "sent", "failed", "dead"]).optional(),
    limit:  z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export const preferenceSchema = z.object({
    username:       z.string().min(2),
    email:          z.string().email(),
    webhook_url:    z.string().url().optional(),
    channel:        z.enum(["email", "webhook", "both"]).default("email"),
    disabled_types: z.array(z.string()).default([]),
});