// All shared types for the Advanced Notification Service

export type NotificationChannel  = "email" | "webhook" | "both";
export type NotificationStatus   = "pending" | "processing" | "sent" | "failed" | "dead";
export type NotificationType     =
    | "welcome" | "password_reset" | "order_confirmation"
    | "low_stock_alert" | "payment_received" | "custom";

// A notification job in the queue
export interface NotificationJob {
    id: number;
    type: NotificationType;
    channel: NotificationChannel;
    recipient_email: string;       // email address
    recipient_webhook: string | null; // URL to POST to
    subject: string;               // rendered subject
    body_html: string;             // rendered HTML
    body_text: string;             // plain text fallback
    payload: string;               // original JSON data (for webhook delivery)
    status: NotificationStatus;
    attempts: number;
    next_attempt_at: string;       // ISO datetime — when to try next
    last_error: string | null;
    sent_at: string | null;
    created_at: string;
    updated_at: string;
}

// Per-user notification preferences
export interface UserPreference {
    id: number;
    username: string;
    email: string;
    webhook_url: string | null;
    channel: NotificationChannel;  // which channels they want
    // Per-type opt-outs stored as comma-separated list
    disabled_types: string;
    created_at: string;
    updated_at: string;
}

// Delivery log — one row per delivery attempt
export interface DeliveryLog {
    id: number;
    job_id: number;
    channel: "email" | "webhook";
    attempt: number;
    success: number;               // SQLite boolean
    response: string | null;       // HTTP status / error message
    attempted_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
    meta?: { total: number; count: number };
}