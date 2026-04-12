/* ── UserRow — as stored in SQLite ── */
export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
}

/* ── User — as returned by the API (no password_hash ever) ──────────
   This is critical — you NEVER send the password hash in a response.
   Even hashed, it gives attackers a target to crack offline.
────────────────────────────────────────────────────────────────────── */
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function toUser(row: UserRow): User {
  return {
    id:        row.id,
    name:      row.name,
    email:     row.email,
    role:      row.role,
    createdAt: row.created_at,
  };
}

/* ── JwtPayload — what we encode inside the token ───────────────────
   Keep the payload small — it's base64 encoded, not encrypted.
   Anyone can decode it. Never put sensitive data (passwords, 
   credit cards) in a JWT payload.
   id and email are enough to identify the user on protected routes.
────────────────────────────────────────────────────────────────────── */
export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

/* ── Extend Express Request to carry the user after auth ────────────
   Once the authenticate middleware verifies the token, it attaches
   the decoded payload to req.user so route handlers can read it.
   We extend Express's Request type so TypeScript knows about req.user.
────────────────────────────────────────────────────────────────────── */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/* ── Student types (same as Day 64) ── */
export interface StudentRow {
  id: number;
  name: string;
  email: string;
  age: number;
  track: string;
  level: string;
  city: string | null;
  gdg_member: number;
  enrolled_at: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: { field: string; message: string }[];
  meta?: { total: number; count: number };
}