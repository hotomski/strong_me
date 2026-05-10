import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

function makeTransporter() {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

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

  const currentCount =
    currentOverride !== null && currentOverride !== undefined
      ? currentOverride
      : bookings.length;

  const prevSixpack = sixpackRemaining ?? 0;
  const ops: Promise<unknown>[] = [
    redis.set(`user:bookings:count-override:${key}`, newCount),
  ];

  // Keep sixpack + bookings = originalAssigned, in both directions
  let newSixpack = prevSixpack;
  if (prevSixpack > 0 || currentCount > 0) {
    const originalAssigned = prevSixpack + currentCount;
    newSixpack = Math.max(0, originalAssigned - newCount);
    ops.push(redis.set(`user:sixpack:${key}`, newSixpack));
  }

  await Promise.all(ops);

  // Send "last 6-pack" email if the 6-pack just hit zero
  if (prevSixpack > 0 && newSixpack === 0) {
    try {
      const transporter = makeTransporter();
      await Promise.all([
        transporter.sendMail({
          from: `StrongME <${process.env.EMAIL_FROM}>`,
          to: key,
          subject: "StrongME — Your 6-Pack Is Complete!",
          text: `Hi there!\n\nThis was your last 6-pack class — we hope you loved every session!\n\nPlease arrange payment for your next classes with Sofija at info@strongme.pro.\n\nSee you on the floor!\nStrongME team`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Your 6-Pack Is Complete!</h2>
              <p>Hi there!</p>
              <p>⚠️ <strong>This was your last 6-pack class</strong> — we hope you loved every session!</p>
              <p>Please arrange payment for your next classes with Sofija at <a href="mailto:info@strongme.pro">info@strongme.pro</a>.</p>
              <p>See you on the floor!<br/>StrongME team</p>
            </div>
          `,
        }),
        transporter.sendMail({
          from: `StrongME <${process.env.EMAIL_FROM}>`,
          to: "info@strongme.pro",
          subject: "⚠️ Last 6-pack entry used — customer needs to arrange new payment",
          text: `Customer ${key} has used their last 6-pack entry (recorded manually by admin).\n\nPlease follow up to arrange their next payment.`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Last 6-Pack Entry Used</h2>
              <p><strong>Customer:</strong> ${key}</p>
              <p>This was recorded manually via the admin panel. Please follow up to arrange their next payment.</p>
            </div>
          `,
        }),
      ]);
    } catch (emailError) {
      console.error("Last-sixpack email failed:", emailError);
      return res.status(200).json({ success: true, email: key, count: newCount, sixpackRemaining: newSixpack, emailSent: false });
    }
  }

  return res.status(200).json({ success: true, email: key, count: newCount, sixpackRemaining: newSixpack, emailSent: newSixpack === 0 && prevSixpack > 0 });
}
