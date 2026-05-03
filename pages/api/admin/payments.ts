import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const PER_PAGE = 10;

const FILTER_DAYS: Record<string, number | null> = {
  all: null,
  "1m": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const { filter = "3m", page = 1, password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }

  const days = FILTER_DAYS[filter] ?? null;
  const fromTs = days !== null ? Date.now() - days * 24 * 60 * 60 * 1000 : 0;

  // Fetch all payments (oldest first), then filter + reverse in memory
  const allRaw = await redis.zrange("payments", 0, -1);

  const allPayments = (allRaw as any[])
    .map((r) => {
      if (!r) return null;
      if (typeof r === "object") return r;
      try { return JSON.parse(r); } catch { return null; }
    })
    .filter(Boolean)
    .filter((p) => new Date(p.date).getTime() >= fromTs)
    .reverse(); // newest first

  const total = allPayments.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(Math.max(1, Number(page)), totalPages);
  const skip = (currentPage - 1) * PER_PAGE;

  const payments = allPayments.slice(skip, skip + PER_PAGE);
  const totalAmount = allPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return res.status(200).json({
    success: true,
    payments,
    total,
    totalPages,
    currentPage,
    totalAmount,
  });
}
