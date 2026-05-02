// All shared types for the User Registration service

export type UserRole   = "user" | "admin";
export type UserStatus = "pending" | "active" | "locked" | "suspended";

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    role: UserRole;
    status: UserStatus;
    failed_login_attempts: number;
    locked_until: string | null;     // ISO datetime; null = not locked
    email_verified: number;          // SQLite boolean (0/1)
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

// Safe user object — never includes password_hash
export interface PublicUser {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    email_verified: boolean;
    last_login_at: string | null;
    created_at: string;
}

// One row per login attempt (success or failure) for audit trail
export interface LoginHistory {
    id: number;
    user_id: number;
    ip_address: string;
    user_agent: string;
    success: number;                 // SQLite boolean
    failure_reason: string | null;   // e.g. "wrong_password", "account_locked"
    attempted_at: string;
}

// Short-lived tokens stored in DB (email verification, password reset)
export interface Token {
    id: number;
    user_id: number;
    token: string;          // a random hex string
    type: "verify_email" | "reset_password";
    expires_at: string;
    used_at: string | null;
    created_at: string;
}

// JWT payload shape
export interface JwtPayload {
    sub: number;            // user id
    username: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
}