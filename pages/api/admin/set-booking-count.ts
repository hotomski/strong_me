import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const { email, count, password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, error: "MISSING_EMAIL" });
  }

  const key = email.trim().toLowerCase();
  const n = Math.max(0, Number(count));

  await redis.set(`user:bookings:count-override:${key}`, n);

  return res.status(200).json({ success: true, email: key, count: n });
}
