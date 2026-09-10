import { Router } from "express";
import { db } from "../db.js";
import { mapProfile } from "../mappers.js";

const router = Router();

router.get("/", (_req, res) => {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  res.json({ ok: true, profile: mapProfile(profile) });
});

export default router;
