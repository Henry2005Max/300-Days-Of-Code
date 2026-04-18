import "dotenv/config";
import http from "http";
import express, { Request, Response } from "express";
import { createChatServer } from "./ws/chatServer";
import apiRouter from "./routes/api";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ── Serve the HTML test client ──────────────────────────────────────
   We serve a simple HTML page that lets you open two tabs and chat.
   This is just for testing — a real frontend would be a React app.
────────────────────────────────────────────────────────────────────── */
app.get("/", (req: Request, res: Response) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChatAPI — Day 71</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f1117; color: #e2e8f0; height: 100vh; display: flex; flex-direction: column; }
    #header { background: #1a1d27; padding: 16px 20px; border-bottom: 1px solid #2d3148; display: flex; align-items: center; gap: 12px; }
    #header h1 { font-size: 16px; font-weight: 600; }
    #status { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; flex-shrink: 0; }
    #status.connected { background: #22c55e; }
    #setup { padding: 20px; display: flex; gap: 10px; background: #1a1d27; border-bottom: 1px solid #2d3148; flex-wrap: wrap; }
    input, select, button { padding: 8px 14px; border-radius: 6px; border: 1px solid #2d3148; background: #0f1117; color: #e2e8f0; font-size: 13px; }
    button { background: #6366f1; border-color: #6366f1; cursor: pointer; font-weight: 600; }
    button:hover { opacity: 0.85; }
    #messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; }
    .msg { padding: 8px 12px; border-radius: 8px; max-width: 70%; font-size: 14px; line-height: 1.5; }
    .msg.mine { background: #6366f1; align-self: flex-end; }
    .msg.theirs { background: #1e2235; align-self: flex-start; }
    .msg.system { background: transparent; color: #64748b; font-size: 12px; align-self: center; font-style: italic; }
    .msg .meta { font-size: 11px; opacity: 0.6; margin-bottom: 3px; }
    #input-row { padding: 16px 20px; background: #1a1d27; border-top: 1px solid #2d3148; display: flex; gap: 10px; }
    #input-row input { flex: 1; }
  </style>
</head>
<body>
  <div id="header">
    <div id="status"></div>
    <h1>ChatAPI — Day 71 · 300 Days of Code · Lagos 🇳🇬</h1>
  </div>

  <div id="setup">
    <input id="username" placeholder="Your name (e.g. Chidi)" style="width:140px"/>
    <select id="room">
      <option value="general">general</option>
      <option value="gdg-lagos">gdg-lagos</option>
      <option value="dev-talk">dev-talk</option>
      <option value="random">random</option>
    </select>
    <button onclick="joinChat()">Join</button>
    <input id="dm-to" placeholder="DM to username" style="width:130px"/>
    <button onclick="sendDm()" style="background:#059669">Send DM</button>
  </div>

  <div id="messages"></div>

  <div id="input-row">
    <input id="msg-input" placeholder="Type a message and press Enter..." onkeydown="if(event.key==='Enter') sendMessage()"/>
    <button onclick="sendMessage()">Send</button>
  </div>

  <script>
    let ws, myUsername;

    function connect() {
      ws = new WebSocket('ws://' + location.host + '/ws');
      ws.onopen    = () => { document.getElementById('status').classList.add('connected'); };
      ws.onclose   = () => { document.getElementById('status').classList.remove('connected'); addMsg('Disconnected from server', 'system'); };
      ws.onerror   = () => addMsg('Connection error', 'system');
      ws.onmessage = (e) => handleMsg(JSON.parse(e.data));
    }

    function handleMsg(msg) {
      if (msg.type === 'welcome')      { addMsg('Connected — ' + msg.message, 'system'); }
      if (msg.type === 'joined')       { myUsername = msg.username; addMsg('You joined #' + msg.room + ' · Online: ' + msg.users.join(', '), 'system'); }
      if (msg.type === 'user_joined')  { addMsg(msg.username + ' joined #' + msg.room, 'system'); }
      if (msg.type === 'user_left')    { addMsg(msg.username + ' left #' + msg.room, 'system'); }
      if (msg.type === 'message')      { addMsg(msg.text, msg.from === myUsername ? 'mine' : 'theirs', msg.from, msg.timestamp); }
      if (msg.type === 'dm')           { addMsg('[DM] ' + msg.text, msg.from === myUsername ? 'mine' : 'theirs', msg.from + ' (DM)', msg.timestamp); }
      if (msg.type === 'error')        { addMsg('Error: ' + msg.message, 'system'); }
      if (msg.type === 'switched')     { addMsg('Switched to #' + msg.room + ' · Online: ' + msg.users.join(', '), 'system'); }
    }

    function addMsg(text, type, from, time) {
      const div = document.createElement('div');
      div.className = 'msg ' + type;
      if (from) div.innerHTML = '<div class="meta">' + from + (time ? ' · ' + new Date(time).toLocaleTimeString() : '') + '</div>' + text;
      else div.textContent = text;
      document.getElementById('messages').appendChild(div);
      document.getElementById('messages').scrollTop = 999999;
    }

    function joinChat() {
      const u = document.getElementById('username').value.trim();
      const r = document.getElementById('room').value;
      if (!u) { alert('Enter a username'); return; }
      if (!ws || ws.readyState !== 1) connect();
      setTimeout(() => ws.send(JSON.stringify({ type: 'join', username: u, room: r })), 300);
    }

    function sendMessage() {
      const input = document.getElementById('msg-input');
      const text = input.value.trim();
      if (!text || !ws) return;
      ws.send(JSON.stringify({ type: 'message', text }));
      input.value = '';
    }

    function sendDm() {
      const to = document.getElementById('dm-to').value.trim();
      const text = document.getElementById('msg-input').value.trim();
      if (!to || !text || !ws) return;
      ws.send(JSON.stringify({ type: 'dm', to, text }));
      document.getElementById('msg-input').value = '';
    }

    connect();
  </script>
</body>
</html>`);
});

app.get("/api", (req: Request, res: Response) => {
    res.json({
        api:    "ChatAPI",
        day:    71,
        author: "Henry Ehindero — Lagos, Nigeria 🇳🇬",
        websocket: `ws://localhost:${PORT}/ws`,
        protocol: {
            connect:  "Open ws://localhost:PORT/ws",
            join:     '{ "type": "join", "username": "Henry", "room": "general" }',
            message:  '{ "type": "message", "text": "Hello everyone!" }',
            dm:       '{ "type": "dm", "to": "Chidi", "text": "Hey privately" }',
            switch:   '{ "type": "switch", "room": "gdg-lagos" }',
        },
        defaultRooms: ["general", "gdg-lagos", "dev-talk", "random"],
        restEndpoints: [
            { method: "GET", path: "/api/stats", description: "Connected clients and room info" },
            { method: "GET", path: "/api/rooms", description: "All active rooms with user counts" },
        ],
    });
});

app.use("/api", apiRouter);

/* ── Create HTTP server and attach WebSocket server ──────────────────
   Both share the same PORT.
   HTTP handles: GET /, GET /api, GET /api/stats
   WebSocket handles: ws://localhost:3000/ws
────────────────────────────────────────────────────────────────────── */
const httpServer = http.createServer(app);
createChatServer(httpServer);

httpServer.listen(PORT, () => {
    console.log(`\n┌──────────────────────────────────────────┐`);
    console.log(`│  ChatAPI — Day 71                        │`);
    console.log(`│  http://localhost:${PORT}                    │`);
    console.log(`│  ws://localhost:${PORT}/ws                   │`);
    console.log(`│  Day 71 · Sprint 3 · Lagos, Nigeria    │`);
    console.log(`└──────────────────────────────────────────┘\n`);
    console.log(`  Open http://localhost:${PORT} in TWO browser tabs to chat!\n`);
});