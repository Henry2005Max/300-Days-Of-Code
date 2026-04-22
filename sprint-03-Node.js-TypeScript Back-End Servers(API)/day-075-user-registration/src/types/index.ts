import { JwtPayload as JwtPayloadBase } from "jsonwebtoken";

export interface UserRow {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    bio: string | null;
    avatar_url: string | null;
    role: string;
    is_active: number;      /* 0 or 1 */
    created_at: string;
    updated_at: string;
}

/* Safe user — never includes password_hash */
export interface User {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginLogRow {
    id: number;
    user_id: number;
    ip: string;
    success: number;
    reason: string | null;
    logged_at: string;
}

export interface JwtPayload extends JwtPayloadBase {
    id: number;
    email: string;
    role: string;
}

/* Extend Express Request */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function toUser(row: UserRow): User {
    return {
        id:        row.id,
        name:      row.name,
        email:     row.email,
        bio:       row.bio,
        avatarUrl: row.avatar_url,
        role:      row.role,
        isActive:  row.is_active === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}