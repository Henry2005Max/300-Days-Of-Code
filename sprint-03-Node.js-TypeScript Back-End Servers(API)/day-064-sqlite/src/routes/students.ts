import { Router, Request, Response } from "express";
import { db } from "../db/database";
import { StudentRow, toStudent } from "../types";
import { CreateStudentSchema, UpdateStudentSchema, StudentQuerySchema, CreateStudentInput } from "../schemas/student";
import { validate, validateQuery } from "../middleware/validate";

const router = Router();

/* ── GET /students ───────────────────────────────────────────────────
   We build the SQL query dynamically based on which filters are set.
   The WHERE clause grows as filters are added.

   IMPORTANT: Never use string concatenation to put user values into SQL:
     BAD:  `WHERE track = '${track}'`  ← SQL injection vulnerability
     GOOD: `WHERE track = ?` with parameters  ← safe prepared statement

   We use named parameters (@track) which better-sqlite3 replaces
   safely before running the query.
────────────────────────────────────────────────────────────────────── */
router.get("/", validateQuery(StudentQuerySchema), (req: Request, res: Response) => {
  const { track, level, city, gdgMember } = req.query as any;

  const conditions: string[] = [];
  const params: Record<string, any> = {};

  if (track) {
    conditions.push("track = @track");
    params.track = track;
  }
  if (level) {
    conditions.push("level = @level");
    params.level = level;
  }
  if (city) {
    conditions.push("LOWER(city) = LOWER(@city)");
    params.city = city;
  }
  if (gdgMember !== undefined) {
    conditions.push("gdg_member = @gdgMember");
    params.gdgMember = gdgMember ? 1 : 0;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM students ${where} ORDER BY enrolled_at DESC`;

  /* .all() returns an array of all matching rows */
  const rows = db.prepare(sql).all(params) as StudentRow[];
  const students = rows.map(toStudent);

  /* Get total count separately for meta */
  const total = (db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number }).count;

  res.status(200).json({
    success: true,
    data: students,
    meta: { total, count: students.length },
  });
});

/* ── GET /students/stats ── */
router.get("/stats", (req: Request, res: Response) => {
  /* SQLite aggregate functions work exactly like in other SQL databases */
  const total = (db.prepare("SELECT COUNT(*) as count FROM students").get() as any).count;
  const gdgCount = (db.prepare("SELECT COUNT(*) as count FROM students WHERE gdg_member = 1").get() as any).count;
  const avgAge = (db.prepare("SELECT AVG(age) as avg FROM students").get() as any).avg;

  /* GROUP BY — groups rows by a column and counts each group */
  const byTrack = db.prepare("SELECT track, COUNT(*) as count FROM students GROUP BY track").all();
  const byLevel = db.prepare("SELECT level, COUNT(*) as count FROM students GROUP BY level").all();

  res.status(200).json({
    success: true,
    data: {
      total,
      gdgMembers: gdgCount,
      averageAge: Number(avgAge?.toFixed(1) ?? 0),
      byTrack,
      byLevel,
    },
  });
});

/* ── GET /students/:id ───────────────────────────────────────────────
   .get() returns a single row or undefined if not found.
   Compare to .all() which always returns an array.
────────────────────────────────────────────────────────────────────── */
router.get("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "ID must be a number" });
    return;
  }

  const row = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as StudentRow | undefined;

  if (!row) {
    res.status(404).json({ success: false, error: `Student with ID ${id} not found` });
    return;
  }

  res.status(200).json({ success: true, data: toStudent(row) });
});

/* ── POST /students ──────────────────────────────────────────────────
   INSERT INTO — adds a new row to the table.
   .run() executes an INSERT/UPDATE/DELETE and returns info about it:
     result.lastInsertRowid → the ID of the newly created row
     result.changes         → how many rows were affected

   The UNIQUE constraint on email means SQLite will throw an error
   if you try to insert a duplicate. We catch that error and return 409.
────────────────────────────────────────────────────────────────────── */
router.post("/", validate(CreateStudentSchema), (req: Request, res: Response) => {
  const input: CreateStudentInput = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO students (name, email, age, track, level, city, gdg_member, enrolled_at)
      VALUES (@name, @email, @age, @track, @level, @city, @gdgMember, @enrolledAt)
    `).run({
      name:       input.name,
      email:      input.email,
      age:        input.age,
      track:      input.track,
      level:      input.level,
      city:       input.city ?? null,
      gdgMember:  input.gdgMember ? 1 : 0,
      enrolledAt: new Date().toISOString().slice(0, 10),
    });

    /* Read back the newly created row using the auto-generated ID */
    const newRow = db.prepare("SELECT * FROM students WHERE id = ?")
      .get(result.lastInsertRowid) as StudentRow;

    res.status(201)
      .header("Location", `/students/${newRow.id}`)
      .json({ success: true, data: toStudent(newRow) });

  } catch (err: any) {
    /* SQLite error code for UNIQUE constraint violation */
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(409).json({
        success: false,
        error: `A student with email "${input.email}" already exists`,
      });
      return;
    }
    throw err; /* re-throw unexpected errors to the global error handler */
  }
});

/* ── PUT /students/:id ───────────────────────────────────────────────
   UPDATE — modifies existing rows.
   We only SET the fields that were actually sent in the body.
   We check result.changes — if 0, the ID didn't exist.
────────────────────────────────────────────────────────────────────── */
router.put("/:id", validate(UpdateStudentSchema), (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "ID must be a number" });
    return;
  }

  const existing = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as StudentRow | undefined;
  if (!existing) {
    res.status(404).json({ success: false, error: `Student with ID ${id} not found` });
    return;
  }

  const body = req.body;

  /* Build UPDATE SET clause dynamically — only update provided fields */
  const setClauses: string[] = [];
  const params: Record<string, any> = { id };

  if (body.name      !== undefined) { setClauses.push("name = @name");           params.name      = body.name; }
  if (body.email     !== undefined) { setClauses.push("email = @email");          params.email     = body.email; }
  if (body.age       !== undefined) { setClauses.push("age = @age");              params.age       = body.age; }
  if (body.track     !== undefined) { setClauses.push("track = @track");          params.track     = body.track; }
  if (body.level     !== undefined) { setClauses.push("level = @level");          params.level     = body.level; }
  if (body.city      !== undefined) { setClauses.push("city = @city");            params.city      = body.city; }
  if (body.gdgMember !== undefined) { setClauses.push("gdg_member = @gdgMember"); params.gdgMember = body.gdgMember ? 1 : 0; }

  if (setClauses.length === 0) {
    res.status(400).json({ success: false, error: "No fields provided to update" });
    return;
  }

  try {
    db.prepare(`UPDATE students SET ${setClauses.join(", ")} WHERE id = @id`).run(params);
    const updated = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as StudentRow;
    res.status(200).json({ success: true, data: toStudent(updated) });
  } catch (err: any) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(409).json({ success: false, error: `Email "${body.email}" is already taken` });
      return;
    }
    throw err;
  }
});

/* ── DELETE /students/:id ── */
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "ID must be a number" });
    return;
  }

  const row = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as StudentRow | undefined;
  if (!row) {
    res.status(404).json({ success: false, error: `Student with ID ${id} not found` });
    return;
  }

  db.prepare("DELETE FROM students WHERE id = ?").run(id);
  res.status(200).json({ success: true, data: toStudent(row) });
});

export default router;