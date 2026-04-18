# Day 71: WebSocket Chat API

## Description

A real-time chat server built with Node.js, Express, and the `ws` library. Supports multiple rooms, direct messages between users, presence notifications (join/leave), and online user lists. The same HTTP server handles both REST endpoints and WebSocket connections on the same port. A built-in HTML client lets you test by opening two browser tabs and chatting between them.

## How WebSockets Work

```
HTTP:       Client sends request → Server responds → Connection CLOSES
WebSocket:  Client connects → Connection STAYS OPEN → Both sides push at any time
```

The connection starts as an HTTP upgrade request (101 Switching Protocols), then the WebSocket protocol takes over on the same TCP connection.

## Message Protocol

All messages are JSON. Client sends:

| Type | Payload | Description |
|------|---------|-------------|
| join | username, room | Register and enter a room |
| message | text | Broadcast to current room |
| dm | to, text | Direct message to a user |
| switch | room | Move to a different room |
| ping | — | Keep-alive |

Server sends back: welcome, joined, message, dm, user_joined, user_left, switched, error, pong

## Features

- WebSocket server on ws://localhost:3000/ws alongside HTTP on port 3000
- 4 default rooms: general, gdg-lagos, dev-talk, random
- Custom rooms created on demand when a user joins a non-default room
- Username validation — must be at least 2 chars and unique
- Broadcast to all room members when someone sends a message
- Direct messages between any two online users
- join/leave presence notifications broadcast to the room
- Online users list sent on join and updated on every change
- Heartbeat ping/pong every 30 seconds — zombie connections terminated
- GET /api/stats — connected clients and room breakdown
- GET /api/rooms — all active rooms with user counts
- Built-in HTML chat client served at GET /

## Technologies Used

- Node.js
- TypeScript
- Express 4
- ws (WebSocket library)
- dotenv
- tsx

## Folder Structure

```
day-071-websocket-chat/
├── src/
│   ├── index.ts              ← HTTP server + serves HTML client
│   ├── ws/
│   │   └── chatServer.ts     ← WebSocket server, rooms, message handlers
│   ├── routes/
│   │   └── api.ts            ← REST endpoints for stats and rooms
│   └── types/
│       └── index.ts          ← ChatClient, ClientMessage, ServerMessage
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
cd Desktop
mkdir day-071-websocket-chat
cd day-071-websocket-chat
mkdir -p src/ws src/routes src/types
```

Copy all files, then:

```bash
npm install
npm run dev
```

## Testing Step by Step

### Browser chat test (most fun):

1. Open `http://localhost:3000` in Tab 1
2. Enter username "Chidi", select room "general", click Join
3. Open `http://localhost:3000` in Tab 2 (or another browser)
4. Enter username "Amaka", select room "general", click Join
5. In Tab 1 — type a message and press Enter → appears in both tabs instantly
6. In Tab 2 — type a reply → appears in both tabs instantly
7. In Tab 1 — type "Amaka" in the DM field, type a message, click Send DM → only Tab 2 sees it
8. In Tab 2 — switch to "gdg-lagos" from the dropdown and rejoin → Tab 1 sees "Amaka left"

### REST endpoints:
- `http://localhost:3000/api/stats` — see connected clients and rooms
- `http://localhost:3000/api/rooms` — all active rooms

### Terminal:
Watch logs — every connection, message, DM, join, and leave is logged.

## What I Learned

- WebSocket connections start as HTTP upgrade requests — the server responds with 101 Switching Protocols and the same TCP connection becomes a WebSocket connection
- The ws library attaches to an existing http.Server via { server: httpServer } — both HTTP and WebSocket share the same port, distinguished by the upgrade header
- WebSocket messages must be strings or Buffers — you always JSON.stringify() before sending and JSON.parse() after receiving
- Extending the WebSocket object (ChatClient extends WebSocket) lets you attach per-client state (id, username, room) directly to the socket object
- Heartbeat ping/pong is necessary to detect zombie connections — browsers that close without sending a proper close frame would otherwise occupy memory indefinitely
- Broadcasting to a room means iterating the room's client ID Set, looking up each client in the Map, and checking readyState === OPEN before sending — a client whose readyState is not OPEN must not be written to

## Challenge Info

| Field | Detail |
|-------|--------|
| Day | 71 |
| Sprint | 3 — Node.js / TypeScript Back-End Servers (Days 61–90) |
| Date | April 18, 2025 |
| Previous | [Day 70 — Error Handling](../day-070-error-handling) |
| Next | [Day 72 — Weather Backend](../day-072-weather-backend) |

Part of my 300 Days of Code Challenge!
