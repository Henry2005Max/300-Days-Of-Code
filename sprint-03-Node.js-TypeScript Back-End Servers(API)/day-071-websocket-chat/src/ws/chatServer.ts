import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { ChatClient, ClientMessage, ServerMessage, Room } from "../types";

/* ── In-memory state ─────────────────────────────────────────────────
   clients: Map<clientId, ChatClient>
   rooms:   Map<roomName, Room>
   We keep track of every connected client and every room.
────────────────────────────────────────────────────────────────────── */
const clients = new Map<string, ChatClient>();
const rooms   = new Map<string, Room>();

/* Ensure the default rooms always exist */
["general", "gdg-lagos", "dev-talk", "random"].forEach((name) => {
    rooms.set(name, { name, clients: new Set() });
});

/* ── Helper — generate a short unique ID ── */
function uid(): string {
    return Math.random().toString(36).slice(2, 9);
}

/* ── Helper — send a typed message to one client ────────────────────
   JSON.stringify converts our typed ServerMessage object to a string.
   WebSocket.send() only accepts strings or Buffers, not objects.
────────────────────────────────────────────────────────────────────── */
function send(client: ChatClient, msg: ServerMessage): void {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
    }
}

/* ── Helper — broadcast to everyone in a room ────────────────────────
   Loops through every client ID in the room, looks them up in the
   clients Map, and sends the message to each one.
   exclude: skip a specific client (usually the sender)
────────────────────────────────────────────────────────────────────── */
function broadcast(roomName: string, msg: ServerMessage, exclude?: string): void {
    const room = rooms.get(roomName);
    if (!room) return;

    room.clients.forEach((clientId) => {
        if (clientId === exclude) return;
        const client = clients.get(clientId);
        if (client) send(client, msg);
    });
}

/* ── Helper — get usernames for all clients in a room ── */
function getRoomUsers(roomName: string): string[] {
    const room = rooms.get(roomName);
    if (!room) return [];
    return Array.from(room.clients)
        .map((id) => clients.get(id)?.username)
        .filter(Boolean) as string[];
}

/* ── Helper — get or create a room ── */
function ensureRoom(name: string): Room {
    if (!rooms.has(name)) {
        rooms.set(name, { name, clients: new Set() });
    }
    return rooms.get(name)!;
}

/* ── Handle client joining a room ────────────────────────────────────
   1. Add client to new room
   2. Remove from old room (if switching)
   3. Send "joined" confirmation to the joiner
   4. Broadcast "user_joined" to everyone else in the room
────────────────────────────────────────────────────────────────────── */
function joinRoom(client: ChatClient, roomName: string): void {
    /* Leave current room first */
    if (client.room && client.room !== roomName) {
        leaveRoom(client, false);
    }

    const room = ensureRoom(roomName);
    room.clients.add(client.id);
    client.room = roomName;

    const users = getRoomUsers(roomName);

    send(client, {
        type:  "joined",
        username: client.username!,
        room:  roomName,
        users,
    });

    /* Tell everyone else someone joined */
    broadcast(roomName, {
        type:     "user_joined",
        username: client.username!,
        room:     roomName,
        users,
    }, client.id);

    console.log(`[WS] ${client.username} joined room: ${roomName}`);
}

/* ── Handle client leaving a room ── */
function leaveRoom(client: ChatClient, notify = true): void {
    if (!client.room) return;

    const room = rooms.get(client.room);
    if (room) {
        room.clients.delete(client.id);

        if (notify && client.username) {
            const users = getRoomUsers(client.room);
            broadcast(client.room, {
                type:     "user_left",
                username: client.username,
                room:     client.room,
                users,
            });
        }

        /* Clean up empty non-default rooms */
        const defaults = ["general", "gdg-lagos", "dev-talk", "random"];
        if (room.clients.size === 0 && !defaults.includes(client.room)) {
            rooms.delete(client.room);
        }
    }

    client.room = undefined;
}

/* ── Main message handler ─────────────────────────────────────────────
   Called every time a client sends a message.
   We parse the JSON, check the type, and handle accordingly.
────────────────────────────────────────────────────────────────────── */
function handleMessage(client: ChatClient, raw: string): void {
    let msg: ClientMessage;

    try {
        msg = JSON.parse(raw) as ClientMessage;
    } catch {
        send(client, { type: "error", message: "Invalid JSON message" });
        return;
    }

    switch (msg.type) {

        /* ── join — set username and enter a room ── */
        case "join": {
            if (!msg.username || msg.username.trim().length < 2) {
                send(client, { type: "error", message: "Username must be at least 2 characters" });
                return;
            }

            /* Check if username is already taken */
            const taken = Array.from(clients.values()).find(
                (c) => c.username === msg.username.trim() && c.id !== client.id
            );
            if (taken) {
                send(client, { type: "error", message: `Username "${msg.username}" is already taken` });
                return;
            }

            client.username = msg.username.trim();
            joinRoom(client, msg.room || "general");
            break;
        }

        /* ── message — broadcast to everyone in the room ── */
        case "message": {
            if (!client.username) {
                send(client, { type: "error", message: "You must join with a username first" });
                return;
            }
            if (!client.room) {
                send(client, { type: "error", message: "You must join a room first" });
                return;
            }
            if (!msg.text?.trim()) {
                send(client, { type: "error", message: "Message cannot be empty" });
                return;
            }

            const outgoing: ServerMessage = {
                type:      "message",
                from:      client.username,
                room:      client.room,
                text:      msg.text.trim(),
                timestamp: new Date().toISOString(),
            };

            /* Send to everyone in the room including the sender */
            broadcast(client.room, outgoing);
            send(client, outgoing); /* send back to sender too */
            console.log(`[WS] [${client.room}] ${client.username}: ${msg.text.trim()}`);
            break;
        }

        /* ── dm — direct message to a specific user ── */
        case "dm": {
            if (!client.username) {
                send(client, { type: "error", message: "Join with a username first" });
                return;
            }

            const target = Array.from(clients.values()).find(
                (c) => c.username === msg.to
            );

            if (!target) {
                send(client, { type: "error", message: `User "${msg.to}" is not online` });
                return;
            }

            const dmMsg: ServerMessage = {
                type:      "dm",
                from:      client.username,
                text:      msg.text.trim(),
                timestamp: new Date().toISOString(),
            };

            send(target, dmMsg);
            send(client, dmMsg); /* echo back to sender */
            console.log(`[WS] DM from ${client.username} to ${msg.to}`);
            break;
        }

        /* ── switch — move to a different room ── */
        case "switch": {
            if (!client.username) {
                send(client, { type: "error", message: "Join with a username first" });
                return;
            }

            joinRoom(client, msg.room);
            send(client, {
                type:  "switched",
                room:  msg.room,
                users: getRoomUsers(msg.room),
            });
            break;
        }

        /* ── ping — keep-alive from client ── */
        case "ping": {
            send(client, { type: "pong" });
            break;
        }

        default: {
            send(client, { type: "error", message: `Unknown message type` });
        }
    }
}

/* ── createChatServer ────────────────────────────────────────────────
   Attaches the WebSocket server to the existing HTTP server.
   path: "/ws" means only connections to ws://localhost:3000/ws
   are handled here. Regular HTTP still works on the same port.
────────────────────────────────────────────────────────────────────── */
export function createChatServer(httpServer: any): WebSocketServer {
    const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

    wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
        const client = ws as ChatClient;
        client.id      = uid();
        client.isAlive = true;

        clients.set(client.id, client);
        console.log(`[WS] Client connected: ${client.id} (total: ${clients.size})`);

        /* Send welcome message immediately */
        send(client, {
            type:    "welcome",
            id:      client.id,
            message: "Connected to ChatAPI. Send { type: 'join', username: 'YourName', room: 'general' } to start.",
        });

        /* ── Incoming messages ── */
        client.on("message", (data) => {
            handleMessage(client, data.toString());
        });

        /* ── Heartbeat — pong response keeps connection alive ── */
        client.on("pong", () => {
            client.isAlive = true;
        });

        /* ── Disconnect ── */
        client.on("close", () => {
            leaveRoom(client, true);
            clients.delete(client.id);
            console.log(`[WS] Client disconnected: ${client.username ?? client.id} (total: ${clients.size})`);
        });

        /* ── Error ── */
        client.on("error", (err) => {
            console.error(`[WS] Client error (${client.id}): ${err.message}`);
        });
    });

    /* ── Heartbeat interval ──────────────────────────────────────────
       Every 30 seconds, ping all clients.
       If a client doesn't respond (isAlive stays false), terminate it.
       This cleans up zombie connections — browsers that closed without
       sending a proper WebSocket close frame.
    ─────────────────────────────────────────────────────────────────── */
    const heartbeat = setInterval(() => {
        clients.forEach((client) => {
            if (!client.isAlive) {
                console.log(`[WS] Terminating zombie connection: ${client.id}`);
                client.terminate();
                return;
            }
            client.isAlive = false;
            client.ping();
        });
    }, 30_000);

    heartbeat.unref();

    wss.on("close", () => clearInterval(heartbeat));

    console.log("[WS] WebSocket chat server ready on ws://localhost:3000/ws");
    return wss;
}

/* ── getStats — for the REST /stats endpoint ── */
export function getChatStats() {
    return {
        connectedClients: clients.size,
        activeRooms: Array.from(rooms.entries()).map(([name, room]) => ({
            name,
            userCount: room.clients.size,
            users:     getRoomUsers(name),
        })),
        onlineUsers: Array.from(clients.values())
            .filter((c) => c.username)
            .map((c) => ({ username: c.username, room: c.room })),
    };
}