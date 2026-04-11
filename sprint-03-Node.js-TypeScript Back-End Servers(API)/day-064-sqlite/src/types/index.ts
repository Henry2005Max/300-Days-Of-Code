/* ── Student as stored in SQLite ─────────────────────────────────────
   Notice gdg_member is INTEGER (0 or 1) not boolean.
   SQLite has no boolean type — it uses 0 and 1.
   We convert to boolean when we read from the database.
────────────────────────────────────────────────────────────────────── */
export interface StudentRow {
  id: number;
  name: string;
  email: string;
  age: number;
  track: string;
  level: string;
  city: string | null;
  gdg_member: number;   /* 0 or 1 in SQLite */
  enrolled_at: string;
}

/* ── Student as returned by the API ─────────────────────────────────
   Clean camelCase with real boolean for gdgMember.
   We transform StudentRow → Student before sending the response.
────────────────────────────────────────────────────────────────────── */
export interface Student {
  id: number;
  name: string;
  email: string;
  age: number;
  track: string;
  level: string;
  city: string | null;
  gdgMember: boolean;
  enrolledAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: { field: string; message: string }[];
  meta?: { total: number; count: number };
}

/* ── Row → API shape ─────────────────────────────────────────────────
   A helper function that converts the raw SQLite row (snake_case,
   integer booleans) into the clean API shape (camelCase, real booleans).
   Call this every time you read from the database.
────────────────────────────────────────────────────────────────────── */
export function toStudent(row: StudentRow): Student {
  return {
    id:         row.id,
    name:       row.name,
    email:      row.email,
    age:        row.age,
    track:      row.track,
    level:      row.level,
    city:       row.city,
    gdgMember:  row.gdg_member === 1,
    enrolledAt: row.enrolled_at,
  };
}