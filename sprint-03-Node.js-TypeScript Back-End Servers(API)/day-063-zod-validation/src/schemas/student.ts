import { z } from "zod";

/* ── What is a Zod schema? ───────────────────────────────────────────
   A schema is a description of what valid data looks like.
   z.object() describes an object with specific fields.
   Each field has a type and optional constraints.

   When you call schema.parse(data):
   - If data matches → returns the validated, typed data
   - If data doesn't match → throws a ZodError with field-by-field errors

   schema.safeParse(data) is the safer version:
   - Returns { success: true, data } on valid input
   - Returns { success: false, error } on invalid input
   - Never throws — we use this in our middleware
────────────────────────────────────────────────────────────────────── */

export const TRACKS = ["Web", "Mobile", "Data", "DevOps", "UI/UX"] as const;
export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

/* ── Create Student Schema ───────────────────────────────────────────
   Used for POST /students — creating a new student.
   Every constraint is explicit and produces a readable error message.
────────────────────────────────────────────────────────────────────── */
export const CreateStudentSchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .min(2, "name must be at least 2 characters")
    .max(100, "name must be at most 100 characters")
    .trim(),

  email: z
    .string({ required_error: "email is required" })
    .email("email must be a valid email address")
    .toLowerCase(),

  age: z
    .number({ required_error: "age is required", invalid_type_error: "age must be a number" })
    .int("age must be a whole number")
    .min(16, "student must be at least 16 years old")
    .max(60, "age must be 60 or below"),

  track: z.enum(TRACKS, {
    errorMap: () => ({
      message: `track must be one of: ${TRACKS.join(", ")}`,
    }),
  }),

  level: z.enum(LEVELS, {
    errorMap: () => ({
      message: `level must be one of: ${LEVELS.join(", ")}`,
    }),
  }),

  city: z
    .string()
    .min(2, "city must be at least 2 characters")
    .trim()
    .optional(), /* optional fields use .optional() — they can be omitted */

  gdgMember: z
    .boolean()
    .optional()
    .default(false), /* default() provides a fallback value if omitted */
});

/* ── Update Student Schema ───────────────────────────────────────────
   Used for PUT /students/:id — updating an existing student.
   .partial() makes ALL fields optional — you only send what you want
   to change. This is the standard pattern for update schemas.

   Without .partial():
     PUT body must include ALL fields (full replacement)
   With .partial():
     PUT body can include ANY subset of fields (partial update)
────────────────────────────────────────────────────────────────────── */
export const UpdateStudentSchema = CreateStudentSchema.partial();

/* ── Query Schema ────────────────────────────────────────────────────
   Used for GET /students — validating query parameters.
   Query params are always strings, so we use z.string() here.
   .optional() means the param can be omitted entirely.
   .transform() converts the string "true"/"false" to a real boolean.
────────────────────────────────────────────────────────────────────── */
export const StudentQuerySchema = z.object({
  track:     z.enum(TRACKS).optional(),
  level:     z.enum(LEVELS).optional(),
  city:      z.string().optional(),
  gdgMember: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true")  return true;
      if (val === "false") return false;
      return undefined;
    }),
});

/* ── z.infer — auto-generate TypeScript types from schemas ───────────
   Instead of defining a TypeScript interface separately,
   z.infer<typeof Schema> extracts the TypeScript type from the schema.
   They stay in sync automatically — if you change the schema,
   the TypeScript type updates too. No duplication.
────────────────────────────────────────────────────────────────────── */
export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type StudentQuery       = z.infer<typeof StudentQuerySchema>;