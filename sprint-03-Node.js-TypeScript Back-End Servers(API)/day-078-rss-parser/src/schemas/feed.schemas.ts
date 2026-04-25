import { z } from "zod";

// POST /feeds — subscribe to a new RSS feed URL
export const subscribeFeedSchema = z.object({
    url: z
        .string()
        .url("Must be a valid URL")
        .refine(
            (v) => v.startsWith("http://") || v.startsWith("https://"),
            "Feed URL must start with http:// or https://"
        ),
});

// GET /feeds/:id/items — list items with optional filters
export const listItemsQuerySchema = z.object({
    limit:      z.coerce.number().int().min(1).max(100).default(20),
    offset:     z.coerce.number().int().min(0).default(0),
    subscriber: z.string().min(1).optional(), // if provided, attaches read status
    unread:     z.coerce.boolean().optional(), // filter to only unread items
});

// POST /feeds/:id/items/:itemId/read — mark an item read
export const markReadSchema = z.object({
    subscriber: z.string().min(1, "Subscriber name is required"),
});

// GET /feeds/:id/unread — unread count for a subscriber
export const unreadQuerySchema = z.object({
    subscriber: z.string().min(1, "Subscriber name is required"),
});