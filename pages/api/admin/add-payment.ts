import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export type Payment = {
  id: string;
  email: string;
  type: "single" | "sixpack";
  amount: number;
  date: string;
  note: string;
  recordedAt: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const { email, type, amount, date, note = "", password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }

  if (!email || !type || !amount || !date) {
    return res.status(400).json({ success: false, error: "MISSING_FIELDS" });
  }

  if (type !== "single" && type !== "sixpack") {
    return res.status(400).json({ success: false, error: "INVALID_TYPE" });
  }

  const payment: Payment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    email: String(email).trim().toLowerCase(),
    type,
    amount: Number(amount),
    date: String(date),
    note: String(note).trim(),
    recordedAt: new Date().toISOString(),
  };

  const score = new Date(date).getTime();
  const member = JSON.stringify(payment);

  await Promise.all([
    redis.zadd("payments", { score, member }),
    redis.zadd(`user:payments:${payment.email}`, { score, member }),
    redis.sadd("all:emails", payment.email),
  ]);

  return res.status(200).json({ success: true, payment });
}
