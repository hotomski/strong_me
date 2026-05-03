import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
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

  // Send confirmation email to the customer
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isSixpack = payment.type === "sixpack";
    const typeLabel = isSixpack ? "6-Pack (6 entries)" : "Single class";
    const detailText = isSixpack
      ? "Your 6-pack gives you 6 entries to use at any upcoming class — book each one at strongme.pro."
      : "";
    const detailHtml = isSixpack
      ? `Your 6-pack gives you <strong>6 entries</strong> to use at any upcoming class. <a href="https://www.strongme.pro">Book your spot at strongme.pro</a>.`
      : "";

    await transporter.sendMail({
      from: `StrongME <${process.env.EMAIL_FROM}>`,
      to: payment.email,
      subject: "StrongME — Payment Confirmed, Thank You!",
      text: `Thank you for your payment!

Payment summary:
Type: ${typeLabel}
Amount: ${payment.amount} CHF
${payment.note ? `Note: ${payment.note}\n` : ""}${detailText ? `\n${detailText}\n` : ""}
If you have any questions, reach us at info@strongme.pro.

See you on the floor!
StrongME team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Thank you for your payment!</h2>
          <table style="border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 6px 16px 6px 0; color: #5f5a55; font-size: 0.9rem;">Type</td>
              <td style="padding: 6px 0; font-weight: 700;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 16px 6px 0; color: #5f5a55; font-size: 0.9rem;">Amount</td>
              <td style="padding: 6px 0; font-weight: 700;">${payment.amount} CHF</td>
            </tr>
            ${payment.note ? `<tr><td style="padding: 6px 16px 6px 0; color: #5f5a55; font-size: 0.9rem;">Note</td><td style="padding: 6px 0;">${payment.note}</td></tr>` : ""}
          </table>
          ${detailHtml ? `<p>${detailHtml}</p>` : ""}
          <p>If you have any questions, reach us at <a href="mailto:info@strongme.pro">info@strongme.pro</a>.</p>
          <p>See you on the floor!<br/>StrongME team</p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Payment confirmation email failed:", emailError);
    // Payment is already recorded — return success but flag the email failure
    return res.status(200).json({ success: true, payment, emailSent: false });
  }

  return res.status(200).json({ success: true, payment, emailSent: true });
}
