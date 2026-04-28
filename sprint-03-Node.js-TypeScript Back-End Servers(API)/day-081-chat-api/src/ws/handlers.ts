// One handler per client message type.
// Each handler receives the sending WebSocket + its ConnectedClient state.
// Handlers are pure functions — they read/write the registry and SQLite,
// then call broadcastToRoom / sendTo to push events to other clients.

import { WebSocket } from "ws";
import { stmts } from "../db/statements";
import * as registry from "./registry";
import { ConnectedClient, ClientMessage, Message, Room } from "../types";

const HISTORY_LIMIT      = Number(process.env.HISTORY_LIMIT)          || 50;
const RATE_MAX           = Number(process.env.RATE_LIMIT_MAX)          || 10;
const RATE_WINDOW_MS     = Number(process.env.RATE_LIMIT_WINDOW_MS)    || 5000;
const TYPING_TIMEOUT_SEC = Number(process.env.TYPING_TIMEOUT_SECONDS)  || 8;

// ── Rate limiter ─────────────────────────────────────────────────────────────

function isRateLimited(client: ConnectedClient): boolean {
    const now = Date.now();
    if (now - client.windowStart > RATE_WINDOW_MS) {
        // Window expired — reset counter
        client.windowStart  = now;
        client.messageCount = 0;
    }
    client.messageCount++;
    return client.messageCount > RATE_MAX;
}

// ── join ─────────────────────────────────────────────────────────────────────

export function handleJoin(
    ws: WebSocket,
    client: ConnectedClient,
    msg: Extract<ClientMessage, { type: "join" }>
): void {
    const room = stmts.getRoomById.get(msg.roomId) as Room | undefined;
    if (!room) {
        ws.send(JSON.stringify({ type: "error", message: `Room ${msg.roomId} does not exist` }));
        return;
    }

    // Leave previous room if in one
    if (client.roomId !== null) {
        registry.broadcastToRoom(client.roomId, {
            type: "presence", username: client.username, status: "offline", roomId: client.roomId,
        }, ws);
    }

    client.username = msg.username;
    client.roomId   = room.id;
    client.status   = "online";

    // Backfill: reverse so messages are oldest-first for the client
    const history = (stmts.getHistory.all(room.id, HISTORY_LIMIT) as Message[]).reverse();

    // Tell the joining client they're in, with history
    ws.send(JSON.stringify({
        type: "joined", roomId: room.id, roomName: room.name, history,
    }));

    // Tell room members this user joined
    registry.broadcastToRoom(room.id, {
        type: "presence", username: client.username, status: "online", roomId: room.id,
    }, ws);

    // Send the full member list to the joining client
    ws.send(JSON.stringify({
        type: "room_members", roomId: room.id, members: registry.getMembersOf(room.id),
    }));
}

// ── message ──────────────────────────────────────────────────────────────────

export function handleMessage(
    ws: WebSocket,
    client: ConnectedClient,
    msg: Extract<ClientMessage, { type: "message" }>
): void {
    if (!client.roomId || !client.username) {
        ws.send(JSON.stringify({ type: "error", message: "Join a room before sending messages" }));
        return;
    }
    if (isRateLimited(client)) {
        ws.send(JSON.stringify({ type: "error", message: "Slow down — rate limit exceeded" }));
        return;
    }
    if (!msg.content?.trim()) return;

    const content = msg.content.trim().slice(0, 2000); // cap at 2000 chars

    const result = stmts.insertMessage.run({
        roomId: client.roomId, username: client.username, content,
    });

    // Stop typing indicator when the user sends a message
    clearTyping(ws, client);

    registry.broadcastToRoom(client.roomId, {
        type: "message",
        id:        result.lastInsertRowid as number,
        roomId:    client.roomId,
        username:  client.username,
        content,
        createdAt: new Date().toISOString(),
    });
}

// ── dm ───────────────────────────────────────────────────────────────────────

export function handleDM(
    ws: WebSocket,
    client: ConnectedClient,
    msg: Extract<ClientMessage, { type: "dm" }>
): void {
    if (!client.username) {
        ws.send(JSON.stringify({ type: "error", message: "Join a room first to establish your username" }));
        return;
    }
    if (isRateLimited(client)) {
        ws.send(JSON.stringify({ type: "error", message: "Slow down — rate limit exceeded" }));
        return;
    }
    if (!msg.content?.trim() || !msg.to) return;
    if (msg.to === client.username) {
        ws.send(JSON.stringify({ type: "error", message: "Cannot send a DM to yourself" }));
        return;
    }

    const content = msg.content.trim().slice(0, 2000);
    const result  = stmts.insertDM.run({ from: client.username, to: msg.to, content });
    const id      = result.lastInsertRowid as number;
    const createdAt = new Date().toISOString();

    const payload = { type: "dm" as const, id, from: client.username, content, createdAt };

    // Deliver to recipient if online
    const delivered = registry.sendTo(msg.to, payload);

    // Echo back to sender (so their UI can show it in the DM thread)
    ws.send(JSON.stringify({ ...payload, delivered }));
}

// ── typing ───────────────────────────────────────────────────────────────────

export function handleTypingStart(ws: WebSocket, client: ConnectedClient): void {
    if (!client.roomId || !client.username) return;

    // Clear any existing timer and restart it — refreshes the auto-expire window
    if (client.typingTimer) clearTimeout(client.typingTimer);

    registry.broadcastToRoom(client.roomId, {
        type: "typing", username: client.username, roomId: client.roomId, typing: true,
    }, ws);

    // Auto-cancel typing indicator if client never sends typing_stop
    client.typingTimer = setTimeout(() => {
        clearTyping(ws, client);
    }, TYPING_TIMEOUT_SEC * 1000);
}

export function handleTypingStop(ws: WebSocket, client: ConnectedClient): void {
    clearTyping(ws, client);
}

function clearTyping(ws: WebSocket, client: ConnectedClient): void {
    if (client.typingTimer) {
        clearTimeout(client.typingTimer);
        client.typingTimer = null;
    }
    if (client.roomId && client.username) {
        registry.broadcastToRoom(client.roomId, {
            type: "typing", username: client.username, roomId: client.roomId, typing: false,
        }, ws);
    }
}

// ── status ───────────────────────────────────────────────────────────────────

export function handleStatus(
    ws: WebSocket,
    client: ConnectedClient,
    msg: Extract<ClientMessage, { type: "status" }>
): void {
    client.status = msg.status;
    if (client.roomId && client.username) {
        registry.broadcastToRoom(client.roomId, {
            type: "presence", username: client.username, status: msg.status, roomId: client.roomId,
        }, ws);
    }
}

// ── disconnect ───────────────────────────────────────────────────────────────

export function handleDisconnect(ws: WebSocket): void {
    const client = registry.deregister(ws);
    if (!client) return;

    // Clear any pending typing timer
    if (client.typingTimer) clearTimeout(client.typingTimer);

    if (client.roomId && client.username) {
        // Notify room that this user went offline
        registry.broadcastToRoom(client.roomId, {
            type: "presence", username: client.username, status: "offline", roomId: client.roomId,
        });
    }
}