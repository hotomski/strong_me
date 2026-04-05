import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { dates } = req.query;
  if (!dates || typeof dates !== "string") {
    return res.status(400).json({ success: false, error: "MISSING_DATES" });
  }

  const dateList = dates.split(",");
  const keys = dateList.map((d) => `bookings:${d}`);
  const counts = await redis.mget<number[]>(...keys);

  const result: Record<string, number> = {};
  dateList.forEach((d, i) => {
    result[d] = counts[i] ?? 0;
  });

  return res.status(200).json({ success: true, counts: result });
}
