import { Router, Request, Response } from "express";
import { students, nextId, incrementNextId } from "../data/students";
import {
  CreateStudentSchema,
  UpdateStudentSchema,
  StudentQuerySchema,
  CreateStudentInput,
} from "../schemas/student";
import { validate, validateQuery } from "../middleware/validate";
import { Student } from "../types";

const router = Router();

/* ── GET /students ───────────────────────────────────────────────────
   validateQuery(StudentQuerySchema) runs first.
   If the query params are invalid → 400 auto-returned.
   If valid → req.query is now typed and transformed (e.g. gdgMember
   is a real boolean, not the string "true").
────────────────────────────────────────────────────────────────────── */
router.get("/", validateQuery(StudentQuerySchema), (req: Request, res: Response) => {
  const { track, level, city, gdgMember } = req.query as any;

  let result = [...students];

  if (track)                 result = result.filter((s) => s.track === track);
  if (level)                 result = result.filter((s) => s.level === level);
  if (city)                  result = result.filter((s) => s.city?.toLowerCase() === (city as string).toLowerCase());
  if (gdgMember !== undefined) result = result.filter((s) => s.gdgMember === gdgMember);

  res.status(200).json({
    success: true,
    data: result,
    meta: { total: students.length, count: result.length },
  });
});

/* ── GET /students/stats ─────────────────────────────────────────────
   Returns aggregate stats across all students.
   Defined before /:id so "stats" isn't treated as an ID.
────────────────────────────────────────────────────────────────────── */
router.get("/stats", (req: Request, res: Response) => {
  const trackCounts: Record<string, number> = {};
  const levelCounts: Record<string, number> = {};
  let gdgCount = 0;

  students.forEach((s) => {
    trackCounts[s.track] = (trackCounts[s.track] || 0) + 1;
    levelCounts[s.level] = (levelCounts[s.level] || 0) + 1;
    if (s.gdgMember) gdgCount++;
  });

  const avgAge = students.length > 0
    ? (students.reduce((sum, s) => sum + s.age, 0) / students.length).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      total: students.length,
      gdgMembers: gdgCount,
      averageAge: Number(avgAge),
      byTrack: trackCounts,
      byLevel: levelCounts,
    },
  });
});

/* ── GET /students/:id ───────────────────────────────────────────────
   No Zod needed here — just a simple ID lookup with manual checks.
   ID validation is simple enough that Zod would be overkill.
────────────────────────────────────────────────────────────────────── */
router.get("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "ID must be a number" });
    return;
  }

  const student = students.find((s) => s.id === id);

  if (!student) {
    res.status(404).json({ success: false, error: `Student with ID ${id} not found` });
    return;
  }

  res.status(200).json({ success: true, data: student });
});

/* ── POST /students ──────────────────────────────────────────────────
   validate(CreateStudentSchema) runs BEFORE this handler.
   By the time this function runs:
   - req.body has been validated
   - req.body has been transformed (trimmed, lowercased, defaults applied)
   - req.body is typed as CreateStudentInput
   The handler only needs to handle business logic — no validation code.
────────────────────────────────────────────────────────────────────── */
router.post("/", validate(CreateStudentSchema), (req: Request, res: Response) => {
  const input: CreateStudentInput = req.body;

  /* Business logic check — duplicate email */
  const existing = students.find(
    (s) => s.email === input.email
  );

  if (existing) {
    res.status(409).json({
      success: false,
      error: `A student with email "${input.email}" already exists`,
    });
    return;
  }

  const newStudent: Student = {
    ...input,
    id: nextId,
    enrolledAt: new Date().toISOString().slice(0, 10),
  };

  students.push(newStudent);
  incrementNextId();

  res.status(201)
    .header("Location", `/students/${newStudent.id}`)
    .json({ success: true, data: newStudent });
});

/* ── PUT /students/:id ───────────────────────────────────────────────
   validate(UpdateStudentSchema) — all fields optional (.partial())
   Only the fields you send get updated. Others stay the same.
────────────────────────────────────────────────────────────────────── */
router.put("/:id", validate(UpdateStudentSchema), (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "ID must be a number" });
    return;
  }

  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, error: `Student with ID ${id} not found` });
    return;
  }

  /* Check new email doesn't clash with another student */
  if (req.body.email) {
    const clash = students.find(
      (s) => s.email === req.body.email && s.id !== id
    );
    if (clash) {
      res.status(409).json({
        success: false,
        error: `Email "${req.body.email}" is already used by another student`,
      });
      return;
    }
  }

  students[index] = { ...students[index], ...req.body };

  res.status(200).json({ success: true, data: students[index] });
});

/* ── DELETE /students/:id ── */
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "ID must be a number" });
    return;
  }

  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, error: `Student with ID ${id} not found` });
    return;
  }

  const deleted = students.splice(index, 1)[0];
  res.status(200).json({ success: true, data: deleted });
});

export default router;