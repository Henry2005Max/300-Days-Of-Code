import { z } from "zod";

// POST /incidents — report a new traffic incident
export const reportIncidentSchema = z.object({
    route_id:    z.coerce.number().int().positive().optional(),
    landmark_id: z.coerce.number().int().positive().optional(),
    type: z.enum([
        "accident", "road_works", "flooding",
        "broken_down_vehicle", "police_checkpoint", "protest", "market_overflow",
    ]),
    severity:    z.enum(["low", "medium", "high"]).default("low"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    reported_by: z.string().min(2, "Reporter name is required"),
    lat:         z.coerce.number().min(-90).max(90),
    lng:         z.coerce.number().min(-180).max(180),
});

// GET /incidents query params
export const listIncidentsQuerySchema = z.object({
    active:   z.coerce.boolean().optional(),
    severity: z.enum(["low", "medium", "high"]).optional(),
    type:     z.string().optional(),
    limit:    z.coerce.number().int().min(1).max(100).default(20),
    offset:   z.coerce.number().int().min(0).default(0),
});

// GET /routes query params
export const listRoutesQuerySchema = z.object({
    condition: z.enum(["free", "light", "moderate", "heavy", "gridlock"]).optional(),
    area:      z.string().optional(),
});

// GET /history query params
export const historyQuerySchema = z.object({
    route_id: z.coerce.number().int().positive().optional(),
    hours:    z.coerce.number().int().min(1).max(48).default(6),
    limit:    z.coerce.number().int().min(1).max(200).default(50),
});