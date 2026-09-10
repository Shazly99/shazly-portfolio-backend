import cors from "cors";
import express from "express";
import { requireAuth } from "./auth.js";
import { config, isOriginAllowed } from "./config.js";
import adminRouter from "./routes/admin.js";
import authRouter from "./routes/auth.js";
import experiencesRouter from "./routes/experiences.js";
import mediaRouter from "./routes/media.js";
import messagesRouter from "./routes/messages.js";
import profileRouter from "./routes/profile.js";
import projectsRouter from "./routes/projects.js";
import skillsRouter from "./routes/skills.js";
import uploadsRouter from "./routes/uploads.js";

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);
app.options("*", cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    name: "Shazly Portfolio API",
    public: [
      "GET /api/health",
      "GET /api/profile",
      "GET /api/skills",
      "GET /api/projects",
      "GET /api/projects/:slug",
      "GET /api/experiences",
      "POST /api/messages",
      "GET /api/uploads/:id",
    ],
    admin: [
      "POST /api/auth/login",
      "GET /api/admin/me",
      "GET /api/admin/stats",
      "GET /api/admin/messages",
      "PATCH /api/admin/messages/:id",
      "DELETE /api/admin/messages/:id",
      "GET /api/admin/projects",
      "POST /api/admin/projects",
      "PUT /api/admin/projects/reorder",
      "PUT /api/admin/projects/:id",
      "DELETE /api/admin/projects/:id",
      "GET /api/admin/experiences",
      "POST /api/admin/experiences",
      "PUT /api/admin/experiences/reorder",
      "PUT /api/admin/experiences/:id",
      "DELETE /api/admin/experiences/:id",
      "POST /api/admin/uploads",
      "GET /api/admin/skills",
      "PUT /api/admin/skills",
      "PUT /api/admin/profile",
    ],
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "portfolio-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/experiences", experiencesRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/uploads", mediaRouter);
app.use("/api/admin/uploads", requireAuth, uploadsRouter);
app.use("/api/admin", requireAuth, adminRouter);

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ ok: false, error: "Image must be 5MB or smaller." });
  }
  if (String(error?.message || "").includes("Only image")) {
    return res.status(400).json({ ok: false, error: error.message });
  }
  res.status(500).json({ ok: false, error: "Something went wrong." });
});

export default app;
