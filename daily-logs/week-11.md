## Day 71 - April 18

**Project:** WebSocket Chat API
**Time Spent:** 3.5 hours

### What I Built

A real-time chat server using Node.js, Express, and the ws library. The HTTP server and WebSocket server share the same port, HTTP handles REST endpoints and the built-in test client, WebSocket handles ws://localhost:3000/ws. Users connect, register a username, and join a room. Messages broadcast to all room members instantly. Direct messages go to a specific online user. Presence notifications (join/leave) go to all room members. A heartbeat ping/pong every 30 seconds detects and terminates zombie connections. Four default rooms exist at startup. Custom rooms are created on demand and deleted when empty. The built-in HTML client lets you open two tabs and actually chat in real time.

### What I Learned

- WebSocket connections begin as HTTP upgrade requests — the client sends Upgrade: websocket and Connection: Upgrade headers, the server responds with 101 Switching Protocols, and from that point the TCP connection speaks the WebSocket framing protocol instead of HTTP
- The ws library attaches to an existing http.Server by passing { server: httpServer } — this means HTTP and WebSocket share the same port and Node.js routes them based on the presence of the Upgrade header
- WebSocket.send() only accepts strings or Buffers — objects must be JSON.stringify()’d before sending. On the receiving end, data.toString() then JSON.parse() gives back the object.
- Extending WebSocket with a ChatClient interface lets you attach per-connection state (id, username, room) directly to the socket object, avoiding a separate Map lookup for basic client info
- Heartbeat detection uses a two-step pattern: set isAlive = false, send ping(). If the client is alive, it sends a pong which triggers the pong event and sets isAlive = true. If isAlive is still false at the next heartbeat, the connection is a zombie and gets terminated.
- readyState === WebSocket.OPEN must be checked before every send — a client can disconnect between the time you loop over the room and the time you call send()

### Resources Used

- https://github.com/websockets/ws
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- https://www.rfc-editor.org/rfc/rfc6455 (WebSocket protocol spec)
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism

### Tomorrow

Day 72 — Weather Backend. A proper weather API server that fetches from Open-Meteo, stores results in SQLite, and serves historical queries.
