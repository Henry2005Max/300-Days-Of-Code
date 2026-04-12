import { Router, Request, Response } from "express";
import { db } from "../db/database";
import { StudentRow, toStudent } from "../types";
import { authenticate } from "../middleware/authenticate";

const router = Router();

/* All student routes require authentication */
router.use(authenticate);

router.get("/", (req: Request, res: Response) => {
  const rows = db.prepare("SELECT * FROM students ORDER BY enrolled_at DESC").all() as StudentRow[];
  const total = (db.prepare("SELECT COUNT(*) as count FROM students").get() as any).count;
  res.status(200).json({
    success: true,
    data: rows.map(toStudent),
    meta: { total, count: rows.length },
  });
});

router.get("/stats", (req: Request, res: Response) => {
  const total = (db.prepare("SELECT COUNT(*) as count FROM students").get() as any).count;
  const gdgCount = (db.prepare("SELECT COUNT(*) as count FROM students WHERE gdg_member = 1").get() as any).count;
  const avgAge = (db.prepare("SELECT AVG(age) as avg FROM students").get() as any).avg;
  const byTrack = db.prepare("SELECT track, COUNT(*) as count FROM students GROUP BY track").all();
  const byLevel = db.prepare("SELECT level, COUNT(*) as count FROM students GROUP BY level").all();

  res.status(200).json({
    success: true,
    data: { total, gdgMembers: gdgCount, averageAge: Number(avgAge?.toFixed(1) ?? 0), byTrack, byLevel },
  });
});

router.get("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ success: false, error: "ID must be a number" }); return; }

  const row = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as StudentRow | undefined;
  if (!row) { res.status(404).json({ success: false, error: `Student with ID ${id} not found` }); return; }

  res.status(200).json({ success: true, data: toStudent(row) });
});

router.post("/", (req: Request, res: Response) => {
  const { name, email, age, track, level, city, gdgMember } = req.body;
  if (!name || !email || !age || !track || !level) {
    res.status(400).json({ success: false, error: "Missing required fields: name, email, age, track, level" });
    return;
  }
  try {
    const result = db.prepare(`
      INSERT INTO students (name, email, age, track, level, city, gdg_member, enrolled_at)
      VALUES (@name, @email, @age, @track, @level, @city, @gdgMember, @enrolledAt)
    `).run({ name, email, age: Number(age), track, level, city: city ?? null, gdgMember: gdgMember ? 1 : 0, enrolledAt: new Date().toISOString().slice(0, 10) });

    const newRow = db.prepare("SELECT * FROM students WHERE id = ?").get(result.lastInsertRowid) as StudentRow;
    res.status(201).json({ success: true, data: toStudent(newRow) });
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(409).json({ success: false, error: `Student with email "${email}" already exists` });
      return;
    }
    throw err;
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ success: false, error: "ID must be a number" }); return; }

  const row = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as StudentRow | undefined;
  if (!row) { res.status(404).json({ success: false, error: `Student with ID ${id} not found` }); return; }

  db.prepare("DELETE FROM students WHERE id = ?").run(id);
  res.status(200).json({ success: true, data: toStudent(row) });
});

export default router;