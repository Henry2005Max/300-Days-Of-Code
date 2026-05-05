import { z } from "zod";

export const subscribeSchema = z.object({
    url: z.string().url("Must be a valid URL"),
});

export const discoverSchema = z.object({
    url: z.string().min(4, "URL required"),
});

export const listItemsQuerySchema = z.object({
    limit:      z.coerce.number().int().min(1).max(100).default(20),
    offset:     z.coerce.number().int().min(0).default(0),
});

export const readSchema = z.object({
    subscriber: z.string().min(1, "Subscriber identifier required"),
});

export const filterSchema = z.object({
    keyword: z.string().min(1, "Keyword required").max(100),
});

export const digestQuerySchema = z.object({
    subscriber:    z.string().min(1, "Subscriber identifier required"),
    matched_only:  z.coerce.boolean().default(false),
    refresh_stale: z.coerce.boolean().default(true),
    limit:         z.coerce.number().int().min(1).max(200).default(
        Number(process.env.DIGEST_LIMIT) || 50
    ),
});