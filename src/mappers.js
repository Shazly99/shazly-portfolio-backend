import { parseJson } from "./utils.js";

export function mapProfile(row) {
  if (!row) return null;
  return {
    name: row.name,
    title: row.title,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    location: row.location,
    github: row.github,
    linkedin: row.linkedin,
    yearsOfExperience: row.years_of_experience,
    bio: row.bio,
    updatedAt: row.updated_at,
  };
}

export function mapSkill(row) {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    highlight: row.highlight,
    summary: row.summary,
    skills: parseJson(row.skills, []),
    sortOrder: row.sort_order,
  };
}

export function mapProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    overview: row.overview,
    image: row.image,
    technologies: parseJson(row.technologies, []),
    liveUrl: row.live_url,
    category: row.category,
    projectType: row.project_type,
    role: row.role,
    challenge: row.challenge,
    solution: row.solution,
    features: parseJson(row.features, []),
    focus: parseJson(row.focus, []),
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMessage(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

export function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  };
}
