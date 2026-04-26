import { z } from "zod";

// POST /geocode — geocode an address string
export const geocodeSchema = z.object({
    address: z.string().min(3, "Address must be at least 3 characters"),
});

// GET /geocode/history — list past searches
export const historyQuerySchema = z.object({
    limit:  z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    country: z.string().optional(),   // filter by country code e.g. "NG"
});

// POST /distance — distance between two location IDs
export const distanceSchema = z.object({
    from_id: z.coerce.number().int().positive("from_id must be a positive integer"),
    to_id:   z.coerce.number().int().positive("to_id must be a positive integer"),
}).refine((d) => d.from_id !== d.to_id, {
    message: "from_id and to_id must be different locations",
    path: ["to_id"],
});

// GET /cities — query params for the Nigerian cities list
export const citiesQuerySchema = z.object({
    state:  z.string().optional(),
    search: z.string().optional(),
    limit:  z.coerce.number().int().min(1).max(50).default(20),
});