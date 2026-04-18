import { Router, Request, Response } from "express";
import { getChatStats } from "../ws/chatServer";

const router = Router();

router.get("/stats", (req: Request, res: Response) => {
    res.json({ success: true, data: getChatStats() });
});

router.get("/rooms", (req: Request, res: Response) => {
    const stats = getChatStats();
    res.json({
        success: true,
        data: stats.activeRooms,
        meta: { count: stats.activeRooms.length },
    });
});

export default router;