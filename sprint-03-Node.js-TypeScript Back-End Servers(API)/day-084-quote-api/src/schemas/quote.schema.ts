import { z } from "zod";

const pageSchema = z.coerce.number().int().min(1).default(1);
const limitSchema = z.coerce.number().int().min(1).max(100).default(
    Number(process.env.DEFAULT_PAGE_SIZE) || 10
);

// GET /quotes
export const listQuerySchema = z.object({
    page:     pageSchema,
    limit:    limitSchema,
    category: z.string().min(1).optional(),
    origin:   z.string().min(1).optional(),
});

// GET /quotes/search
export const searchQuerySchema = z.object({
    q:     z.string().min(2, "Search query must be at least 2 characters"),
    page:  pageSchema,
    limit: limitSchema,
});

// GET /quotes/tag/:tag
export const tagQuerySchema = z.object({
    page:  pageSchema,
    limit: limitSchema,
});

// POST /quotes
export const createQuoteSchema = z.object({
    text:     z.string().min(5,  "Quote text must be at least 5 characters").max(1000),
    author:   z.string().min(2,  "Author name required"),
    origin:   z.string().min(2).default("Unknown"),
    category: z.string().min(2).default("general"),
    tags:     z.array(z.string().min(1).max(50)).max(10).default([]),
});

// POST /quotes/:id/favourite, DELETE /quotes/:id/favourite
export const favouriteSchema = z.object({
    username: z.string().min(2, "Username must be at least 2 characters").max(50),
});

// GET /favourites/:username
export const favouriteQuerySchema = z.object({
    page:  pageSchema,
    limit: limitSchema,
});