import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end();
  }

  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, error: "MISSING_EMAIL" });
  }

  const key = email.trim().toLowerCase();

  const [bookingsRaw, sixpackRemaining, paymentsRaw] = await Promise.all([
    redis.get<string>(`user:bookings:${key}`),
    redis.get<number>(`user:sixpack:${key}`),
    redis.zrange(`user:payments:${key}`, 0, -1),
  ]);

  const bookings: Array<{ date: string; type: string; bookedAt: string }> =
    bookingsRaw ? JSON.parse(bookingsRaw) : [];

  const payments = (paymentsRaw as string[])
    .map((r) => { try { return JSON.parse(r); } catch { return null; } })
    .filter(Boolean)
    .reverse(); // newest first

  return res.status(200).json({
    success: true,
    bookings: bookings.sort((a, b) => b.date.localeCompare(a.date)),
    sixpackRemaining: sixpackRemaining ?? 0,
    payments,
  });
}
