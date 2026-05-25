import { z } from 'zod';

export const IngredientSchema = z.object({
    name:     z.string().min(1),
    quantity: z.string().min(1),
    unit:     z.string().default(''),
    notes:    z.string().optional().nullable(),
});

export const StepSchema = z.object({
    stepNumber:  z.number().int().positive(),
    instruction: z.string().min(1),
});

export const CreateRecipeSchema = z.object({
    name:        z.string().min(2).max(200),
    category:    z.string().min(1).max(100),
    description: z.string().default(''),
    servings:    z.number().int().positive().default(4),
    prepMins:    z.number().int().min(0).default(0),
    cookMins:    z.number().int().min(0).default(0),
    difficulty:  z.enum(['easy', 'medium', 'hard']).default('medium'),
    imageUrl:    z.string().url().optional().nullable(),
    ingredients: z.array(IngredientSchema).min(1),
    steps:       z.array(StepSchema).min(1),
});

export const UpdateRecipeSchema = CreateRecipeSchema.partial();

export const PaginationSchema = z.object({
    page:     z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(50).default(10),
    q:        z.string().optional(),
    category: z.string().optional(),
    ingredient: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeSchema>;
export type PaginationInput   = z.infer<typeof PaginationSchema>;