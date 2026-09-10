import { Router } from "express";
import { db } from "../db.js";
import { mapExperience } from "../mappers.js";

const router = Router();

router.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM experiences WHERE published = 1 ORDER BY sort_order ASC, id ASC")
    .all();
  res.json({ ok: true, count: rows.length, experiences: rows.map(mapExperience) });
});

export default router;
