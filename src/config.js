import "dotenv/config";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

export function isOriginAllowed(origin) {
  if (!origin) return true;

  if (config.allowAllOrigins) return true;
  if (config.origins.includes(origin)) return true;
  if (localOriginPattern.test(origin)) return true;

  return false;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  origins: (process.env.CLIENT_ORIGINS || "http://localhost:8080,http://localhost:5174")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  allowAllOrigins: (process.env.CLIENT_ORIGINS || "").split(",").map((v) => v.trim()).includes("*"),
  jwtSecret: required("JWT_SECRET"),
  adminEmail: required("ADMIN_EMAIL").toLowerCase(),
  adminPassword: required("ADMIN_PASSWORD"),
};
