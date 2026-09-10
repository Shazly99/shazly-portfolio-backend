import { Router } from "express";
import { db } from "../db.js";
import { mapSkill } from "../mappers.js";

const router = Router();

router.get("/", (_req, res) => {
  const groups = db.prepare("SELECT * FROM skill_groups ORDER BY sort_order ASC, id ASC").all();
  res.json({ ok: true, skillGroups: groups.map(mapSkill) });
});

export default router;
