import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./auth.js";
import { config } from "./config.js";
import { projects, profile, skillGroups, skillsPage, experiences } from "./seed-data.js";
import { toJson } from "./utils.js";

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "portfolio.db"));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    location TEXT,
    github TEXT,
    linkedin TEXT,
    years_of_experience INTEGER,
    bio TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS skill_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    icon TEXT,
    highlight TEXT,
    summary TEXT,
    skills TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS skills_page (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    kicker TEXT NOT NULL,
    title TEXT NOT NULL,
    title_highlight TEXT NOT NULL,
    intro TEXT NOT NULL,
    stats TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    overview TEXT,
    image TEXT,
    technologies TEXT NOT NULL,
    live_url TEXT,
    category TEXT,
    project_type TEXT,
    role TEXT,
    challenge TEXT,
    solution TEXT,
    features TEXT NOT NULL,
    focus TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    data BLOB NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    period TEXT NOT NULL,
    location TEXT,
    progression TEXT NOT NULL,
    highlights TEXT NOT NULL,
    projects TEXT NOT NULL,
    is_current INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function now() {
  return new Date().toISOString();
}

function seedIfEmpty() {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount === 0) {
    db.prepare(
      "INSERT INTO users (email, password_hash, name, created_at) VALUES (?, ?, ?, ?)",
    ).run(config.adminEmail, hashPassword(config.adminPassword), "Ahmed Elshazly", now());
  }

  const profileCount = db.prepare("SELECT COUNT(*) AS count FROM profile").get().count;
  if (profileCount === 0) {
    db.prepare(`
      INSERT INTO profile (
        id, name, title, email, phone, whatsapp, location, github, linkedin,
        years_of_experience, bio, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      profile.name,
      profile.title,
      profile.email,
      profile.phone,
      profile.whatsapp,
      profile.location,
      profile.github,
      profile.linkedin,
      profile.yearsOfExperience,
      profile.bio,
      now(),
    );
  }

  const skillCount = db.prepare("SELECT COUNT(*) AS count FROM skill_groups").get().count;
  if (skillCount === 0) {
    const insertSkill = db.prepare(`
      INSERT INTO skill_groups (title, icon, highlight, summary, skills, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    skillGroups.forEach((group, index) => {
      insertSkill.run(group.title, group.icon, group.highlight, group.summary, toJson(group.skills), index);
    });
  }

  const skillsPageCount = db.prepare("SELECT COUNT(*) AS count FROM skills_page").get().count;
  if (skillsPageCount === 0) {
    db.prepare(`
      INSERT INTO skills_page (id, kicker, title, title_highlight, intro, stats, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `).run(
      skillsPage.kicker,
      skillsPage.title,
      skillsPage.titleHighlight,
      skillsPage.intro,
      toJson(skillsPage.stats),
      now(),
    );
  }

  const projectCount = db.prepare("SELECT COUNT(*) AS count FROM projects").get().count;
  if (projectCount === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (
        slug, title, description, overview, image, technologies, live_url, category,
        project_type, role, challenge, solution, features, focus, published, sort_order,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);
    projects.forEach((project, index) => {
      insertProject.run(
        project.slug,
        project.title,
        project.description,
        project.overview,
        project.image,
        toJson(project.technologies),
        project.liveUrl,
        project.category,
        project.projectType,
        project.role,
        project.challenge,
        project.solution,
        toJson(project.features),
        toJson(project.focus),
        index,
        now(),
        now(),
      );
    });
  }

  const experienceCount = db.prepare("SELECT COUNT(*) AS count FROM experiences").get().count;
  if (experienceCount === 0) {
    const insertExperience = db.prepare(`
      INSERT INTO experiences (
        company, role, period, location, progression, highlights, projects,
        is_current, published, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);
    experiences.forEach((experience, index) => {
      insertExperience.run(
        experience.company,
        experience.role,
        experience.period,
        experience.location,
        toJson(experience.progression || []),
        toJson(experience.highlights || []),
        toJson(experience.projects || []),
        experience.isCurrent ? 1 : 0,
        index,
        now(),
        now(),
      );
    });
  }
}

seedIfEmpty();
