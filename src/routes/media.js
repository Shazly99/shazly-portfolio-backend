import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/:id", (req, res) => {
  const upload = db
    .prepare("SELECT mime_type, data, filename FROM uploads WHERE id = ?")
    .get(req.params.id);

  if (!upload || !upload.data) {
    return res.status(404).json({ ok: false, error: "Image not found." });
  }

  res.setHeader("Content-Type", upload.mime_type || "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  if (upload.filename) {
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(upload.filename)}"`);
  }
  res.send(Buffer.from(upload.data));
});

export default router;
