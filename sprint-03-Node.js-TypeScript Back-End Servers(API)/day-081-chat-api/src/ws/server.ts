// WebSocket server setup.
//
// Optimisation vs Day 71: we attach the WS server to the existing Express
// HTTP server via `handleUpgrade` rather than creating a second server.
// This means a single port handles both HTTP (REST) and WS connections.
//
// Heartbeat pattern:
//   Every HEARTBEAT_INTERVAL_MS the server sends a ping frame to all clients.
//   Each client is expected to respond with a pong. We mark clients with
//   `isAlive = false` before the ping; if no pong arrives before the next
//   tick, the connection is considered dead and terminated.
//   This detects silent disconnects (e.g. laptop closed, no TCP FIN sent).

import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";
import * as registry from "./registry";
import {
    handleJoin,
    handleMessage,
    handleDM,
    handleTypingStart,
    handleTypingStop,
    handleStatus,
    handleDisconnect,
} from "./handlers";
import { ClientMessage, ConnectedClient } from "../types";

const HEARTBEAT_INTERVAL_MS = Number(process.env.HEARTBEAT_INTERVAL_MS) || 30000;

// Extend WebSocket with the alive flag used by the heartbeat
interface LiveSocket extends WebSocket {
    isAlive: boolean;
}

export function attachWebSocketServer(httpServer: Server): WebSocketServer {
    const wss = new WebSocketServer({ noServer: true });

    // Handle the HTTP → WS upgrade — fires before the connection event
    httpServer.on("upgrade", (req: IncomingMessage, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        });
    });

    wss.on("connection", (ws: WebSocket) => {
        const liveWs = ws as LiveSocket;
        liveWs.isAlive = true;

        // Mark alive on every pong frame received from this client
        liveWs.on("pong", () => { liveWs.isAlive = true; });

        // Create the client record — username/roomId filled in on "join"
        const client: ConnectedClient = {
            ws,
            username:     "",
            roomId:       null,
            status:       "online",
            joinedAt:     Date.now(),
            messageCount: 0,
            windowStart:  Date.now(),
            typingTimer:  null,
        };

        registry.register(ws, client);

        ws.on("message", (raw) => {
            let msg: ClientMessage;
            try {
                msg = JSON.parse(raw.toString());
            } catch {
                ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
                return;
            }

            switch (msg.type) {
                case "join":         handleJoin(ws, client, msg);         break;
                case "message":      handleMessage(ws, client, msg);      break;
                case "dm":           handleDM(ws, client, msg);           break;
                case "typing_start": handleTypingStart(ws, client);       break;
                case "typing_stop":  handleTypingStop(ws, client);        break;
                case "status":       handleStatus(ws, client, msg);       break;
                case "ping":         ws.send(JSON.stringify({ type: "pong" })); break;
                default:
                    ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
            }
        });

        ws.on("close", () => handleDisconnect(ws));
        ws.on("error", (err) => {
            console.error("[ws] Socket error:", err.message);
            handleDisconnect(ws);
        });
    });

    // Heartbeat loop — detects dead connections every HEARTBEAT_INTERVAL_MS
    const heartbeat = setInterval(() => {
        (wss.clients as Set<LiveSocket>).forEach((ws) => {
            if (!ws.isAlive) {
                handleDisconnect(ws);
                ws.terminate();
                return;
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, HEARTBEAT_INTERVAL_MS);

    wss.on("close", () => clearInterval(heartbeat));

    console.log("[ws] WebSocket server attached");
    return wss;
}