// REST companion to the WebSocket chat.
// These endpoints let clients fetch data without holding a WS connection open.

import { Router, Request, Response } from "express";
import { asyncHandler, NotFoundError, BadRequestError } from "../middleware/errorHandler";
import { stmts } from "../db/statements";
import db from "../db/database";
import * as registry from "../ws/registry";
import { Room, Message, DirectMessage } from "../types";

const router = Router();

function parseId(raw: string, label: string): number {
    const id = parseInt(raw, 10);
    if (isNaN(id)) throw new NotFoundError(label, raw);
    return id;
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

// GET /rooms — list all rooms with live member count
router.get("/rooms", asyncHandler(async (_req, res) => {
    const rooms = stmts.listRooms.all() as Room[];
    const enriched = rooms.map((r) => ({
        ...r,
        online_count: registry.inRoom(r.id).length,
        members:      registry.getMembersOf(r.id),
    }));
    res.json({ success: true, data: enriched, meta: { total: enriched.length, count: enriched.length } });
}));

// POST /rooms — create a new room
router.post("/rooms", asyncHandler(async (req: Request, res: Response) => {
    const { name, description = "" } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
        throw new BadRequestError("Room name must be at least 2 characters");
    }
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    const existing = stmts.getRoomByName.get(slug) as Room | undefined;
    if (existing) throw new BadRequestError(`Room "${slug}" already exists`);

    const result = stmts.insertRoom.run({ name: slug, description });
    const room   = stmts.getRoomById.get(result.lastInsertRowid) as Room;
    res.status(201).json({ success: true, data: room });
}));

// GET /rooms/:id/messages — paginated message history
router.get("/rooms/:id/messages", asyncHandler(async (req: Request, res: Response) => {
    const id    = parseId(req.params.id, "Room");
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const room = stmts.getRoomById.get(id) as Room | undefined;
    if (!room) throw new NotFoundError("Room", id);

    const messages = (stmts.getHistory.all(id, limit) as Message[]).reverse();
    res.json({ success: true, data: messages, meta: { total: messages.length, count: messages.length } });
}));

// ── Direct messages ───────────────────────────────────────────────────────────

// GET /dm/:username — conversation history between two users
router.get("/dm/:username", asyncHandler(async (req: Request, res: Response) => {
    const { username }  = req.params;
    const { as: viewer, limit = "50" } = req.query as Record<string, string>;

    if (!viewer) throw new BadRequestError("Query param ?as=YOUR_USERNAME is required");

    const history = stmts.getDMHistory.all({
        a: viewer, b: username, limit: Math.min(Number(limit), 200),
    }) as DirectMessage[];

    // Mark unread messages as read now that the viewer fetched them
    const unread = history.filter((m) => m.to_username === viewer && !m.read_at);
    if (unread.length > 0) {
        const markMany = db.transaction(() => {
            for (const m of unread) stmts.markDMRead.run(m.id);
        });
        markMany();
    }

    res.json({ success: true, data: history.reverse(), meta: { total: history.length, count: history.length } });
}));

// GET /dm/unread/:username — count of unread DMs for a user
router.get("/dm/unread/:username", asyncHandler(async (req: Request, res: Response) => {
    const unread = stmts.getUnreadDMs.all(req.params.username) as DirectMessage[];
    res.json({ success: true, data: { count: unread.length, messages: unread } });
}));

// ── Server stats ──────────────────────────────────────────────────────────────

// GET /stats — live connection stats
router.get("/stats", asyncHandler(async (_req, res) => {
    res.json({
        success: true,
        data: {
            connected_clients: registry.size(),
            rooms: (stmts.listRooms.all() as Room[]).map((r) => ({
                id:     r.id,
                name:   r.name,
                online: registry.inRoom(r.id).length,
            })),
        },
    });
}));

export default router;