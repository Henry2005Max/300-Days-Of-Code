import { z } from "zod";

export const TRACKS = ["Web", "Mobile", "Data", "DevOps", "UI/UX"] as const;
export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const CreateStudentSchema = z.object({
  name:      z.string({ required_error: "name is required" }).min(2).max(100).trim(),
  email:     z.string({ required_error: "email is required" }).email().toLowerCase(),
  age:       z.number({ required_error: "age is required", invalid_type_error: "age must be a number" }).int().min(16).max(60),
  track:     z.enum(TRACKS, { errorMap: () => ({ message: `track must be one of: ${TRACKS.join(", ")}` }) }),
  level:     z.enum(LEVELS, { errorMap: () => ({ message: `level must be one of: ${LEVELS.join(", ")}` }) }),
  city:      z.string().min(2).trim().optional(),
  gdgMember: z.boolean().optional().default(false),
});

export const UpdateStudentSchema = CreateStudentSchema.partial();

export const StudentQuerySchema = z.object({
  track:     z.enum(TRACKS).optional(),
  level:     z.enum(LEVELS).optional(),
  city:      z.string().optional(),
  gdgMember: z.string().optional().transform((val) => {
    if (val === "true")  return true;
    if (val === "false") return false;
    return undefined;
  }),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type StudentQuery       = z.infer<typeof StudentQuerySchema>;