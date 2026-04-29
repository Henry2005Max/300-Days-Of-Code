import { z } from "zod";

// GET /weather/:city — single city current weather
export const cityParamSchema = z.object({
    city: z.string().min(2, "City name must be at least 2 characters"),
});

// GET /forecast/:city
export const forecastQuerySchema = z.object({
    days: z.coerce.number().int().min(1).max(5).default(5),
});

// GET /compare — multi-city comparison
export const compareQuerySchema = z.object({
    cities: z
        .string()
        .min(1, "Provide at least one city")
        .transform((v) =>
            v.split(",")
                .map((c) => c.trim().toLowerCase())
                .filter(Boolean)
        )
        .refine((arr) => arr.length >= 2 && arr.length <= 6, {
            message: "Provide between 2 and 6 cities separated by commas",
        }),
});

// GET /alerts
export const alertsQuerySchema = z.object({
    city:   z.string().min(2).optional(),
    active: z.coerce.boolean().optional(),
});