import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import { AVAILABLE_DATES_ARRAY } from "@/lib/constants";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const { password } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
  }

  // Class booking counts
  const dateKeys = AVAILABLE_DATES_ARRAY.map((d) => `bookings:${d}`);
  const counts = await redis.mget<number[]>(...dateKeys);
  const classCounts: Record<string, number> = {};
  AVAILABLE_DATES_ARRAY.forEach((d, i) => {
    classCounts[d] = counts[i] ?? 0;
  });

  // All users
  const allEmails = (await redis.smembers("all:emails")) as string[];

  let users: Array<{
    email: string;
    sixpackRemaining: number;
    hadSixpack: boolean;
    bookingCount: number;
    lastBooking: string | null;
  }> = [];

  if (allEmails.length > 0) {
    const sixpackKeys = allEmails.map((e) => `user:sixpack:${e}`);
    const sixpackDateKeys = allEmails.map((e) => `user:sixpack:startdate:${e}`);
    const bookingsKeys = allEmails.map((e) => `user:bookings:${e}`);
    const overrideKeys = allEmails.map((e) => `user:bookings:count-override:${e}`);

    const [sixpackCounts, sixpackDates, bookingsRaws, overrideCounts] = await Promise.all([
      redis.mget<number[]>(...sixpackKeys),
      redis.mget<string[]>(...sixpackDateKeys),
      redis.mget<any[]>(...bookingsKeys),
      redis.mget<number[]>(...overrideKeys),
    ]);

    users = allEmails.map((email, i) => {
      const sixpackRemaining = sixpackCounts[i] ?? 0;
      const hadSixpack = sixpackDates[i] !== null && sixpackDates[i] !== undefined;
      const raw = bookingsRaws[i];
      const bookings = Array.isArray(raw) ? raw : (raw ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : []);
      const lastBooking = bookings.length > 0 ? bookings[bookings.length - 1].date : null;
      const bookingCount = overrideCounts[i] !== null && overrideCounts[i] !== undefined ? overrideCounts[i] : bookings.length;
      return { email, sixpackRemaining, hadSixpack, bookingCount, lastBooking };
    });

    users.sort((a, b) => {
      if (b.sixpackRemaining !== a.sixpackRemaining) return b.sixpackRemaining - a.sixpackRemaining;
      return a.email.localeCompare(b.email);
    });
  }

  return res.status(200).json({ success: true, classCounts, users });
}
