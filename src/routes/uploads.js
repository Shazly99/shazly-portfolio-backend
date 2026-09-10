import { Router } from "express";
import multer from "multer";
import { db } from "../db.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed."));
      return;
    }
    cb(null, true);
  },
});

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: "Please choose an image file." });
  }

  const result = db.prepare(`
    INSERT INTO uploads (filename, mime_type, size, data, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    req.file.originalname || "upload",
    req.file.mimetype,
    req.file.size,
    req.file.buffer,
    new Date().toISOString(),
  );

  const id = Number(result.lastInsertRowid);
  const url = `/api/uploads/${id}`;

  res.status(201).json({
    ok: true,
    upload: {
      id,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url,
    },
  });
});

export default router;
