// The registry is a single Map from WebSocket instance → ConnectedClient.
// Everything that needs to know "who is connected" or "who is in room X"
// reads from here. It is the only global mutable state in the WS layer.
//
// Optimisation: broadcast() serialises the JSON payload ONCE (outside the
// loop) and sends the same Buffer to every client. This avoids N JSON.stringify
// calls for N recipients — measurable at scale.

import { WebSocket } from "ws";
import { ConnectedClient, ServerMessage, UserStatus } from "../types";

const clients = new Map<WebSocket, ConnectedClient>();

export function register(ws: WebSocket, client: ConnectedClient): void {
    clients.set(ws, client);
}

export function deregister(ws: WebSocket): ConnectedClient | undefined {
    const client = clients.get(ws);
    clients.delete(ws);
    return client;
}

export function get(ws: WebSocket): ConnectedClient | undefined {
    return clients.get(ws);
}

export function getByUsername(username: string): ConnectedClient | undefined {
    for (const client of clients.values()) {
        if (client.username === username) return client;
    }
    return undefined;
}

// All clients currently in a specific room
export function inRoom(roomId: number): ConnectedClient[] {
    const result: ConnectedClient[] = [];
    for (const client of clients.values()) {
        if (client.roomId === roomId) result.push(client);
    }
    return result;
}

// Serialise once, send the buffer to all OPEN clients in the room
export function broadcastToRoom(roomId: number, msg: ServerMessage, exclude?: WebSocket): void {
    const payload = Buffer.from(JSON.stringify(msg));
    for (const client of clients.values()) {
        if (client.roomId === roomId && client.ws !== exclude && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(payload);
        }
    }
}

// Send to exactly one client by username
export function sendTo(username: string, msg: ServerMessage): boolean {
    const client = getByUsername(username);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return false;
    client.ws.send(JSON.stringify(msg));
    return true;
}

export function getMembersOf(roomId: number): { username: string; status: UserStatus }[] {
    return inRoom(roomId).map((c) => ({ username: c.username, status: c.status }));
}

export function size(): number {
    return clients.size;
}