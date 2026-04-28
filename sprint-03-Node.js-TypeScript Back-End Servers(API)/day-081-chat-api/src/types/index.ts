// All shared types for the Chat API

import { WebSocket } from "ws";

export type UserStatus = "online" | "away" | "offline";

// Stored in SQLite
export interface Room {
    id: number;
    name: string;         // e.g. "general", "lagos-devs"
    description: string;
    created_at: string;
}

export interface Message {
    id: number;
    room_id: number;
    username: string;
    content: string;
    created_at: string;
}

export interface DirectMessage {
    id: number;
    from_username: string;
    to_username: string;
    content: string;
    read_at: string | null;
    created_at: string;
}

// Live, in-memory only — not persisted
export interface ConnectedClient {
    ws: WebSocket;
    username: string;
    roomId: number | null;
    status: UserStatus;
    joinedAt: number;
    // Rate limiting state
    messageCount: number;
    windowStart: number;
    // Typing debounce timer handle
    typingTimer: ReturnType<typeof setTimeout> | null;
}

// ── WebSocket message shapes ─────────────────────────────────────────────────
// All WS messages are JSON with a `type` discriminator field.

export type ClientMessage =
    | { type: "join";          roomId: number; username: string }
    | { type: "message";       content: string }
    | { type: "dm";            to: string; content: string }
    | { type: "typing_start" }
    | { type: "typing_stop"  }
    | { type: "status";        status: UserStatus }
    | { type: "ping"         };

export type ServerMessage =
    | { type: "joined";        roomId: number; roomName: string; history: Message[] }
    | { type: "message";       id: number; roomId: number; username: string; content: string; createdAt: string }
    | { type: "dm";            id: number; from: string; content: string; createdAt: string }
    | { type: "dm_read";       messageId: number; readAt: string }
    | { type: "typing";        username: string; roomId: number; typing: boolean }
    | { type: "presence";      username: string; status: UserStatus; roomId: number | null }
    | { type: "room_members";  roomId: number; members: { username: string; status: UserStatus }[] }
    | { type: "error";         message: string }
    | { type: "pong"         };

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: { total: number; count: number };
}