import { Router } from "express";
import { signToken, verifyPassword } from "../auth.js";
import { db } from "../db.js";
import { mapUser } from "../mappers.js";
import { rateLimit } from "../rateLimit.js";
import { isEmail, text } from "../utils.js";

const router = Router();

router.post("/login", rateLimit({ max: 8 }), (req, res) => {
  const email = text(req.body?.email).toLowerCase();
  const password = String(req.body?.password ?? "");

  if (!isEmail(email) || password.length < 6) {
    return res.status(400).json({ ok: false, error: "Enter a valid email and password." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ ok: false, error: "Invalid email or password." });
  }

  res.json({
    ok: true,
    token: signToken(user),
    user: mapUser(user),
  });
});

export default router;
