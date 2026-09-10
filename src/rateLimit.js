const buckets = new Map();

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 8 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key)?.filter((time) => now - time < windowMs) ?? [];

    if (bucket.length >= max) {
      return res.status(429).json({
        ok: false,
        error: "Too many requests. Please try again later.",
      });
    }

    bucket.push(now);
    buckets.set(key, bucket);
    next();
  };
}
