import { WebSocket } from "ws";

/* ── Every connected client gets one of these ────────────────────────
   We extend the WebSocket object with our own fields.
   id       → unique ID assigned on connection
   username → set after the user sends a "join" message
   room     → which room they're currently in
────────────────────────────────────────────────────────────────────── */
export interface ChatClient extends WebSocket {
    id: string;
    username?: string;
    room?: string;
    isAlive: boolean; /* for heartbeat ping/pong */
}

/* ── Message types the client can send to the server ─────────────────
   All messages are JSON with a "type" field.
   This is the protocol we define — both sides must follow it.
────────────────────────────────────────────────────────────────────── */
export type ClientMessage =
    | { type: "join";    username: string; room: string }
    | { type: "message"; text: string }
    | { type: "dm";      to: string; text: string }
    | { type: "switch";  room: string }
    | { type: "ping" };

/* ── Message types the server sends to clients ── */
export type ServerMessage =
    | { type: "welcome";    id: string; message: string }
    | { type: "joined";     username: string; room: string; users: string[] }
    | { type: "message";    from: string; room: string; text: string; timestamp: string }
    | { type: "dm";         from: string; text: string; timestamp: string }
    | { type: "user_joined"; username: string; room: string; users: string[] }
    | { type: "user_left";  username: string; room: string; users: string[] }
    | { type: "switched";   room: string; users: string[] }
    | { type: "error";      message: string }
    | { type: "pong" };

/* ── Room state ── */
export interface Room {
    name: string;
    clients: Set<string>; /* client IDs */
}