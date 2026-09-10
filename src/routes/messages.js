import { Router } from "express";
import { db } from "../db.js";
import { mapMessage } from "../mappers.js";
import { rateLimit } from "../rateLimit.js";
import { isEmail, isPhone, text } from "../utils.js";

const router = Router();

router.post("/", rateLimit({ max: 6 }), (req, res) => {
  if (text(req.body?._honey)) {
    return res.status(200).json({ ok: true });
  }

  const name = text(req.body?.name);
  const email = text(req.body?.email).toLowerCase();
  const phone = text(req.body?.phone);
  const subject = text(req.body?.subject);
  const message = text(req.body?.message);

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ ok: false, error: "Please enter a valid name." });
  }
  if (!isEmail(email) || email.length > 254) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email." });
  }
  if (phone && !isPhone(phone)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid phone number." });
  }
  if (subject.length > 160) {
    return res.status(400).json({ ok: false, error: "Subject is too long." });
  }
  if (message.length < 10 || message.length > 2000) {
    return res.status(400).json({
      ok: false,
      error: "Please enter a message between 10 and 2000 characters.",
    });
  }

  const result = db.prepare(`
    INSERT INTO messages (name, email, phone, subject, message, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(name, email, phone, subject, message, new Date().toISOString());

  const saved = db.prepare("SELECT * FROM messages WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ ok: true, message: mapMessage(saved) });
});

export default router;
