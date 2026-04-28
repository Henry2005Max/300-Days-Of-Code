# Day 81: Chat API with WebSockets

## Description

An advanced real-time chat API built on `ws` and Express. Supports multiple persistent rooms, full message history backfill on join, user presence tracking, typing indicators with server-side auto-expiry, direct messages with read receipts, per-connection rate limiting, and a REST companion API for fetching history without a live WebSocket connection. A single HTTP server handles both REST and WS traffic on the same port.

## What's New

Day 81 is a substantial upgrade over Day 71's basic WebSocket chat. New: persistent SQLite history (new joiners see the last 50 messages), user presence events, typing indicators with server-side debounce, DMs with read receipts, and per-connection rate limiting. Architectural improvements: pre-compiled prepared statements cached at module level, single-buffer broadcast (serialise once, send N times), and `handleUpgrade` for single-port HTTP+WS rather than two separate servers.

## Features

- Multiple persistent rooms — created via REST, survive restarts
- History backfill on join — last 50 messages delivered immediately
- Presence system — `online` / `away` / `offline` events broadcast to room
- Typing indicators — auto-cancelled after 8 seconds if client disconnects
- Direct messages — stored in SQLite, delivered live if recipient is online
- Read receipts — DMs marked `read_at` when the recipient fetches the thread
- Rate limiting — 10 messages per 5 seconds per connection, inline no middleware overhead
- Heartbeat — server pings every 30 seconds, dead connections terminated
- REST API — `/rooms`, `/rooms/:id/messages`, `/dm/:username`, `/stats`
- Pre-compiled prepared statements for all hot-path DB operations

## Technologies Used

- Node.js + TypeScript
- Express 4 + `http.createServer` (shared server)
- ws 8
- better-sqlite3
- Zod (REST validation)
- dotenv
- tsx (dev runner)

## Folder Structure

```
sprint-03-backend/day-081-chat-api/
├── src/
│   ├── db/
│   │   ├── database.ts       # Migrations + room seed
│   │   └── statements.ts     # Pre-compiled prepared statements
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── routes/
│   │   └── chat.ts           # REST endpoints
│   ├── types/
│   │   └── index.ts
│   ├── ws/
│   │   ├── handlers.ts       # One handler per message type
│   │   ├── registry.ts       # In-memory client registry + broadcast
│   │   └── server.ts         # WS server setup + heartbeat
│   └── index.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
mkdir day-081-chat-api
cd day-081-chat-api
mkdir -p src/routes src/middleware src/db src/types src/ws
```

Copy all files into the structure above, then:

```bash
npm install
```

## How to Run

```bash
npm run dev
```

## Testing Step by Step

Use **two terminal windows** for WS testing — one per "user". The `wscat` tool (`npm install -g wscat`) is the easiest way to send WS messages.

### Step 1: Install wscat (one time)

```bash
npm install -g wscat
```

### Step 2: Start the server

```bash
npm run dev
```

### Step 3: Connect as Chidi (Terminal 1)

```bash
wscat -c ws://localhost:3000
```

Then send:

```json
{"type":"join","roomId":1,"username":"Chidi"}
```

You will receive a `joined` event with room name and message history.

### Step 4: Connect as Amaka (Terminal 2)

```bash
wscat -c ws://localhost:3000
```

Then send:

```json
{"type":"join","roomId":1,"username":"Amaka"}
```

Terminal 1 should receive a `presence` event showing Amaka joined.

### Step 5: Chidi sends a message (Terminal 1)

```json
{"type":"message","content":"Omo, e don do. Third Mainland is grid-locked again."}
```

Both terminals receive the `message` event.

### Step 6: Amaka shows typing then sends (Terminal 2)

```json
{"type":"typing_start"}
```

Terminal 1 receives `{"type":"typing","username":"Amaka","typing":true}`.

```json
{"type":"message","content":"Which side? Bariga end or the Island end?"}
```

Terminal 1 receives `typing false` then the message.

### Step 7: Chidi sends a DM to Amaka (Terminal 1)

```json
{"type":"dm","to":"Amaka","content":"Meet me at VI after work?"}
```

Terminal 2 receives the `dm` event. Terminal 1 gets an echo with `delivered: true`.

### Step 8: Amaka changes status to away (Terminal 2)

```json
{"type":"status","status":"away"}
```

Terminal 1 receives a `presence` event.

### Step 9: Check DM history via REST

```bash
curl "http://localhost:3000/dm/Amaka?as=Chidi"
```

### Step 10: Check unread DMs

```bash
curl http://localhost:3000/dm/unread/Amaka
```

### Step 11: List rooms with live member counts

```bash
curl http://localhost:3000/rooms
```

### Step 12: Check live stats

```bash
curl http://localhost:3000/stats
```

Expected: `connected_clients: 2`, room 1 shows `online: 2`.

### Step 13: Test rate limiting

Send 11 messages rapidly from one terminal. The 11th returns:

```json
{"type":"error","message":"Slow down — rate limit exceeded"}
```

### Step 14: Create a new room via REST

```bash
curl -X POST http://localhost:3000/rooms \
  -H "Content-Type: application/json" \
  -d '{"name":"abuja-devs","description":"Abuja developer community"}'
```

## What I Learned

- Caching prepared statements at module level (in `statements.ts`) rather than calling `db.prepare()` inside message handlers means SQLite parses the SQL exactly once — not on every incoming WebSocket message, which can be hundreds per second
- Serialising the broadcast payload to a Buffer once (`Buffer.from(JSON.stringify(msg))`) and sending the same buffer to all N clients avoids N redundant `JSON.stringify` calls — the savings grow linearly with the number of recipients
- `wss.handleUpgrade` + `noServer: true` lets a single port serve both Express HTTP and WebSocket connections — the upgrade header in the HTTP request signals which protocol to use, so no port conflict
- The typing auto-expiry pattern (clearTimeout + setTimeout in `handleTypingStart`) is idempotent: calling it rapidly refreshes the window without stacking multiple timers. This is critical — without it, a client that calls `typing_start` twice and `typing_stop` zero times would leave the indicator stuck until the first timer fires
- Read receipts via a nullable `read_at` column are simpler than a separate `reads` junction table for DMs — they work perfectly for 1-to-1 messages where there is exactly one reader

## Challenge Info

| Field    | Value |
|----------|-------|
| Day      | 81 |
| Sprint   | 3 — Node.js Back-End Servers |
| Date     | April 28, 2026 |
| Previous | [Day 80 — Lagos Traffic Mock API](../day-080-lagos-traffic/) |
| Next     | [Day 82 — Weather Backend Service](../day-082-weather-backend/) |

Part of my 300 Days of Code Challenge!
