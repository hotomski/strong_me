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

  const { email, entries, startDate, password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, error: "MISSING_EMAIL" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const sixpackEntries = Math.max(0, Math.min(6, Number(entries) || 6));
  const date = startDate ? String(startDate) : new Date().toISOString().slice(0, 10);

  await Promise.all([
    redis.set(`user:sixpack:${normalizedEmail}`, sixpackEntries),
    redis.set(`user:sixpack:startdate:${normalizedEmail}`, date),
    redis.set(`user:bookings:count-override:${normalizedEmail}`, 0),
    redis.sadd("all:emails", normalizedEmail),
  ]);

  return res.status(200).json({
    success: true,
    email: normalizedEmail,
    entries: sixpackEntries,
    startDate: date,
  });
}
