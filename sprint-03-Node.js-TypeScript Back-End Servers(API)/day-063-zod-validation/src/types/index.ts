import { CreateStudentInput } from "../schemas/student";

/* ── Student type ────────────────────────────────────────────────────
   The full student record as stored in memory.
   Extends the validated input type with server-generated fields
   (id, enrolledAt) that the client never sends.
────────────────────────────────────────────────────────────────────── */
export interface Student extends CreateStudentInput {
  id: number;
  enrolledAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: { field: string; message: string }[];
  meta?: {
    total: number;
    count: number;
  };
}