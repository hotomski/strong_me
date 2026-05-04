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
  const newCount = Math.max(0, Number(count));

  const [bookingsRaw, sixpackRemaining, currentOverride] = await Promise.all([
    redis.get<any>(`user:bookings:${key}`),
    redis.get<number>(`user:sixpack:${key}`),
    redis.get<number>(`user:bookings:count-override:${key}`),
  ]);

  const bookings = Array.isArray(bookingsRaw)
    ? bookingsRaw
    : bookingsRaw
      ? (() => { try { return JSON.parse(bookingsRaw); } catch { return []; } })()
      : [];

  const currentCount = currentOverride !== null && currentOverride !== undefined
    ? currentOverride
    : bookings.length;

  const delta = newCount - currentCount;

  const ops: Promise<unknown>[] = [
    redis.set(`user:bookings:count-override:${key}`, newCount),
  ];

  let newSixpack = sixpackRemaining ?? 0;
  if (delta > 0 && newSixpack > 0) {
    newSixpack = Math.max(0, newSixpack - delta);
    ops.push(redis.set(`user:sixpack:${key}`, newSixpack));
  }

  await Promise.all(ops);

  return res.status(200).json({ success: true, email: key, count: newCount, sixpackRemaining: newSixpack });
}
