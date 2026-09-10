import { Router } from "express";
import { db } from "../db.js";
import { mapSkill, mapSkillsPage } from "../mappers.js";

const router = Router();

router.get("/", (_req, res) => {
  const page = db.prepare("SELECT * FROM skills_page WHERE id = 1").get();
  const groups = db.prepare("SELECT * FROM skill_groups ORDER BY sort_order ASC, id ASC").all();
  res.json({
    ok: true,
    page: mapSkillsPage(page),
    skillGroups: groups.map(mapSkill),
  });
});

export default router;
