import { z } from "zod";

const currencyCode = z
    .string()
    .length(3, "Currency code must be exactly 3 characters")
    .transform((v) => v.toUpperCase());

// GET /rates/:base
export const ratesQuerySchema = z.object({
    currencies: z
        .string()
        .optional()
        .transform((v) =>
            v ? v.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean) : []
        ),
});

// GET /rates/:base/:currency/trend
export const trendQuerySchema = z.object({
    days: z.coerce.number().int().min(1).max(30).default(7),
});

// POST /convert
export const convertSchema = z.object({
    from:   currencyCode,
    to:     currencyCode,
    amount: z.coerce.number().positive("Amount must be a positive number"),
}).refine((d) => d.from !== d.to, {
    message: "from and to currencies must be different",
    path: ["to"],
});

// POST /alerts
export const createAlertSchema = z.object({
    base:      currencyCode,
    currency:  currencyCode,
    direction: z.enum(["above", "below"]),
    threshold: z.coerce.number().positive("Threshold must be positive"),
    label:     z.string().max(200).default(""),
});

// GET /conversion-log
export const logQuerySchema = z.object({
    limit:  z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});