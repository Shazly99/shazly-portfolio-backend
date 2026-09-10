import { Router } from "express";
import { db } from "../db.js";
import { mapProject } from "../mappers.js";

const router = Router();

router.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, id ASC")
    .all();
  res.json({ ok: true, count: rows.length, projects: rows.map(mapProject) });
});

router.get("/:slug", (req, res) => {
  const project = db
    .prepare("SELECT * FROM projects WHERE slug = ? AND published = 1")
    .get(req.params.slug);

  if (!project) {
    return res.status(404).json({ ok: false, error: "Project not found." });
  }

  res.json({ ok: true, project: mapProject(project) });
});

export default router;
