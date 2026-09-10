import { Router } from "express";
import { db } from "../db.js";
import { mapMessage, mapProfile, mapProject, mapSkill, mapUser } from "../mappers.js";
import { parseJson, slugify, text, toJson } from "../utils.js";

const router = Router();

function now() {
  return new Date().toISOString();
}

function readProjectInput(body, existing = {}) {
  const title = text(body?.title) || existing.title || "";
  const slug = slugify(body?.slug || title) || existing.slug || "";
  const description = text(body?.description) || existing.description || "";

  return {
    slug,
    title,
    description,
    overview: text(body?.overview) || existing.overview || "",
    image: text(body?.image) || existing.image || "",
    technologies: toJson(parseJson(body?.technologies, existing.technologies || [])),
    liveUrl: text(body?.liveUrl ?? body?.live_url) || existing.live_url || "",
    category: text(body?.category) || existing.category || "",
    projectType: text(body?.projectType ?? body?.project_type) || existing.project_type || "",
    role: text(body?.role) || existing.role || "",
    challenge: text(body?.challenge) || existing.challenge || "",
    solution: text(body?.solution) || existing.solution || "",
    features: toJson(parseJson(body?.features, existing.features || [])),
    focus: toJson(parseJson(body?.focus, existing.focus || [])),
    published: Number(body?.published ?? existing.published ?? 1) ? 1 : 0,
    sortOrder: Number(body?.sortOrder ?? body?.sort_order ?? existing.sort_order ?? 0),
  };
}

router.get("/me", (req, res) => {
  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(req.user.sub);
  if (!user) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  res.json({ ok: true, user: mapUser(user) });
});

router.get("/stats", (_req, res) => {
  const messages = db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread FROM messages").get();
  const projects = db.prepare("SELECT COUNT(*) AS total FROM projects").get();
  res.json({
    ok: true,
    stats: {
      messages: { total: messages.total, unread: messages.unread || 0 },
      projects: { total: projects.total },
    },
  });
});

router.get("/messages", (_req, res) => {
  const rows = db.prepare("SELECT * FROM messages ORDER BY created_at DESC").all();
  res.json({ ok: true, count: rows.length, messages: rows.map(mapMessage) });
});

router.patch("/messages/:id", (req, res) => {
  const message = db.prepare("SELECT * FROM messages WHERE id = ?").get(req.params.id);
  if (!message) {
    return res.status(404).json({ ok: false, error: "Message not found." });
  }

  const isRead = req.body?.isRead === false ? 0 : 1;
  db.prepare("UPDATE messages SET is_read = ? WHERE id = ?").run(isRead, message.id);
  const updated = db.prepare("SELECT * FROM messages WHERE id = ?").get(message.id);
  res.json({ ok: true, message: mapMessage(updated) });
});

router.delete("/messages/:id", (req, res) => {
  const result = db.prepare("DELETE FROM messages WHERE id = ?").run(req.params.id);
  if (!result.changes) {
    return res.status(404).json({ ok: false, error: "Message not found." });
  }
  res.json({ ok: true });
});

router.get("/projects", (_req, res) => {
  const rows = db.prepare("SELECT * FROM projects ORDER BY sort_order ASC, id ASC").all();
  res.json({ ok: true, count: rows.length, projects: rows.map(mapProject) });
});

router.post("/projects", (req, res) => {
  const input = readProjectInput(req.body);
  if (!input.slug || input.title.length < 2 || input.description.length < 10) {
    return res.status(400).json({ ok: false, error: "Title, slug, and description are required." });
  }

  try {
    const result = db.prepare(`
      INSERT INTO projects (
        slug, title, description, overview, image, technologies, live_url, category,
        project_type, role, challenge, solution, features, focus, published, sort_order,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.slug,
      input.title,
      input.description,
      input.overview,
      input.image,
      input.technologies,
      input.liveUrl,
      input.category,
      input.projectType,
      input.role,
      input.challenge,
      input.solution,
      input.features,
      input.focus,
      input.published,
      input.sortOrder,
      now(),
      now(),
    );
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ ok: true, project: mapProject(project) });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ ok: false, error: "A project with this slug already exists." });
    }
    throw error;
  }
});

router.put("/projects/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ ok: false, error: "Project not found." });
  }

  const input = readProjectInput(req.body, existing);
  if (!input.slug || input.title.length < 2 || input.description.length < 10) {
    return res.status(400).json({ ok: false, error: "Title, slug, and description are required." });
  }

  try {
    db.prepare(`
      UPDATE projects SET
        slug = ?, title = ?, description = ?, overview = ?, image = ?, technologies = ?,
        live_url = ?, category = ?, project_type = ?, role = ?, challenge = ?, solution = ?,
        features = ?, focus = ?, published = ?, sort_order = ?, updated_at = ?
      WHERE id = ?
    `).run(
      input.slug,
      input.title,
      input.description,
      input.overview,
      input.image,
      input.technologies,
      input.liveUrl,
      input.category,
      input.projectType,
      input.role,
      input.challenge,
      input.solution,
      input.features,
      input.focus,
      input.published,
      input.sortOrder,
      now(),
      existing.id,
    );
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(existing.id);
    res.json({ ok: true, project: mapProject(project) });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({ ok: false, error: "A project with this slug already exists." });
    }
    throw error;
  }
});

router.delete("/projects/:id", (req, res) => {
  const result = db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  if (!result.changes) {
    return res.status(404).json({ ok: false, error: "Project not found." });
  }
  res.json({ ok: true });
});

router.get("/skills", (_req, res) => {
  const groups = db.prepare("SELECT * FROM skill_groups ORDER BY sort_order ASC, id ASC").all();
  res.json({ ok: true, skillGroups: groups.map(mapSkill) });
});

router.put("/skills", (req, res) => {
  const groups = Array.isArray(req.body?.skillGroups) ? req.body.skillGroups : null;
  if (!groups) {
    return res.status(400).json({ ok: false, error: "skillGroups array is required." });
  }

  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM skill_groups").run();
    const insert = db.prepare(`
      INSERT INTO skill_groups (title, icon, highlight, summary, skills, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    groups.forEach((group, index) => {
      const title = text(group?.title);
      if (!title) return;
      insert.run(
        title,
        text(group?.icon),
        text(group?.highlight),
        text(group?.summary),
        toJson(parseJson(group?.skills, [])),
        Number(group?.sortOrder ?? index),
      );
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const saved = db.prepare("SELECT * FROM skill_groups ORDER BY sort_order ASC, id ASC").all();
  res.json({ ok: true, skillGroups: saved.map(mapSkill) });
});

router.put("/profile", (req, res) => {
  const current = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  const next = {
    name: text(req.body?.name) || current.name,
    title: text(req.body?.title) || current.title,
    email: text(req.body?.email) || current.email,
    phone: text(req.body?.phone) || current.phone,
    whatsapp: text(req.body?.whatsapp) || current.whatsapp,
    location: text(req.body?.location) || current.location,
    github: text(req.body?.github) || current.github,
    linkedin: text(req.body?.linkedin) || current.linkedin,
    yearsOfExperience: Number(req.body?.yearsOfExperience ?? current.years_of_experience),
    bio: text(req.body?.bio) || current.bio,
  };

  db.prepare(`
    UPDATE profile SET
      name = ?, title = ?, email = ?, phone = ?, whatsapp = ?, location = ?,
      github = ?, linkedin = ?, years_of_experience = ?, bio = ?, updated_at = ?
    WHERE id = 1
  `).run(
    next.name,
    next.title,
    next.email,
    next.phone,
    next.whatsapp,
    next.location,
    next.github,
    next.linkedin,
    next.yearsOfExperience,
    next.bio,
    now(),
  );

  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  res.json({ ok: true, profile: mapProfile(profile) });
});

export default router;
