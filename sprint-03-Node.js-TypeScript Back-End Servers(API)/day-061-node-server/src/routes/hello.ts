import { Router, Request, Response } from "express";

/* ── What is a Router? ───────────────────────────────────────────────
   A Router is a mini Express app.
   You define routes on it, then attach it to the main app in index.ts.
   This keeps your code organised — each file handles one area of your API.
   In bigger apps you'd have routes/users.ts, routes/products.ts, etc.
────────────────────────────────────────────────────────────────────── */
const router = Router();

/* ── GET /hello ──────────────────────────────────────────────────────
   The simplest possible route.
   GET means "give me data" — the browser uses GET when you type a URL.
   res.json() sends a JSON response with status 200 automatically.
────────────────────────────────────────────────────────────────────── */
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello from Day 61!",
    sprint: "Sprint 3 — Node.js Back-End",
    day: 61,
    author: "Henry Ehindero",
    location: "Lagos, Nigeria",
  });
});

/* ── GET /hello/:name ────────────────────────────────────────────────
   The :name part is a route PARAMETER.
   Whatever you put after /hello/ becomes req.params.name
   Example: GET /hello/Chidi  → req.params.name === "Chidi"
   Example: GET /hello/Amaka  → req.params.name === "Amaka"
   This is how you pass data to the server through the URL itself.
────────────────────────────────────────────────────────────────────── */
router.get("/:name", (req: Request, res: Response) => {
  const { name } = req.params;

  /* Basic input sanitisation — trim whitespace, capitalise first letter */
  const cleanName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);

  res.json({
    message: `Hello, ${cleanName}! Welcome to Sprint 3.`,
    name: cleanName,
    timestamp: new Date().toISOString(),
  });
});

/* ── POST /hello/echo ────────────────────────────────────────────────
   POST means "send me data to process".
   Unlike GET, POST has a REQUEST BODY — a JSON object you send along.
   Express reads this body because we added express.json() in index.ts.
   Without express.json() middleware, req.body would be undefined.

   To test this you need Postman (or curl) — your browser can't send
   a POST request with a body just by typing in the URL bar.
────────────────────────────────────────────────────────────────────── */
router.post("/echo", (req: Request, res: Response) => {
  const body = req.body;

  /* If no body was sent, tell the client */
  if (!body || Object.keys(body).length === 0) {
    res.status(400).json({
      error: "No body provided",
      hint: "Send a JSON body with your POST request",
    });
    return;
  }

  res.json({
    message: "Here is what you sent me:",
    received: body,
    keys: Object.keys(body),
    timestamp: new Date().toISOString(),
  });
});

export default router;