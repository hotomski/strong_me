import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { date, email } = req.body;

  if (!date || !email) {
    return res.status(400).json({
      success: false,
      error: "MISSING_FIELDS",
      message: "Date and email are required.",
    });
  }

  const trimmedEmail = String(email).trim();
  const normalizedEmail = trimmedEmail.toLowerCase();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  if (!isEmailValid) {
    return res.status(400).json({
      success: false,
      error: "INVALID_EMAIL",
      message: "Invalid email address.",
    });
  }

  const dateParts = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateParts) {
    return res.status(400).json({
      success: false,
      error: "INVALID_DATE",
      message: "Invalid booking date.",
    });
  }
  const bookingDate = new Date(
    Number(dateParts[1]),
    Number(dateParts[2]) - 1,
    Number(dateParts[3])
  );

  const dateKey = `bookings:${date}`;
  const currentCount = (await redis.get<number>(dateKey)) ?? 0;
  if (currentCount >= 10) {
    return res.status(409).json({
      success: false,
      error: "CLASS_FULL",
      message: "This class is fully booked.",
    });
  }

  // Check sixpack status before sending emails
  const sixpackKey = `user:sixpack:${normalizedEmail}`;
  const sixpackRemaining = (await redis.get<number>(sixpackKey)) ?? 0;

  let newSixpackRemaining = sixpackRemaining;
  let sixpackStatus: "none" | "used" | "last_used" = "none";

  if (sixpackRemaining > 0) {
    newSixpackRemaining = sixpackRemaining - 1;
    sixpackStatus = newSixpackRemaining === 0 ? "last_used" : "used";
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // STARTTLS — encrypts after connection upgrade
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const formattedDate = bookingDate.toLocaleDateString("en-CH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const pad = (n: number) => String(n).padStart(2, "0");
    const y = bookingDate.getFullYear();
    const m = pad(bookingDate.getMonth() + 1);
    const d = pad(bookingDate.getDate());
    const dtStart = `${y}${m}${d}T103000`;
    const dtEnd   = `${y}${m}${d}T113000`;
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//StrongME//EN",
      "BEGIN:VEVENT",
      `UID:strongme-${y}${m}${d}@strongme.pro`,
      `DTSTART;TZID=Europe/Zurich:${dtStart}`,
      `DTEND;TZID=Europe/Zurich:${dtEnd}`,
      "SUMMARY:StrongME Class",
      "DESCRIPTION:Joyful strength and movement class. Questions? info@strongme.pro",
      "LOCATION:Otto-Schütz-Weg 9\\, 8050 Zurich",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const sixpackTextNote =
      sixpackStatus === "used"
        ? `\n6-Pack: ${newSixpackRemaining} ${newSixpackRemaining === 1 ? "entry" : "entries"} remaining.`
        : sixpackStatus === "last_used"
        ? `\n⚠️ This was your last 6-pack class! Please arrange payment for your next classes with Sofija.`
        : "";

    const sixpackHtmlNote =
      sixpackStatus === "used"
        ? `<p>🎟️ <strong>6-Pack:</strong> ${newSixpackRemaining} ${newSixpackRemaining === 1 ? "entry" : "entries"} remaining. <a href="https://www.strongme.pro/my-bookings">View your bookings →</a></p>`
        : sixpackStatus === "last_used"
        ? `<p>⚠️ <strong>This was your last 6-pack class!</strong> Please arrange payment for your next classes with Sofija.</p>`
        : "";

    // 1) Confirmation email to the customer
    await transporter.sendMail({
      from: `StrongME <${process.env.EMAIL_FROM}>`,
      to: trimmedEmail,
      subject: "StrongME Class Booking Confirmation",
      text: `Thank you for booking your StrongME class!

Details:
Date: ${formattedDate}
Time: 10:30 AM
Location: Otto-Schütz-Weg 9, 8050 Zurich
${sixpackTextNote}
What to bring:
👟 Sports shoes — lace up something you love to move in!
💧 Water — hydration is self-love, bring a bottle!
🧘 Yoga mat — if you have one, bring it for our floor practice.
🧖 Towel — we promise you'll need it, this class is joyful AND sweaty!

If you need to cancel, please email us at info@strongme.pro.
Check your bookings: https://www.strongme.pro/my-bookings

Cheers,
StrongME team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>StrongME Class Booking Confirmation</h2>
          <p>Thank you for booking your StrongME class.</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> 10:30 AM</p>
          <p><strong>Location:</strong> Otto-Schütz-Weg 9, 8050 Zurich</p>
          ${sixpackHtmlNote}
          <p><strong>What to bring:</strong></p>
          <ul>
            <li>👟 <strong>Sports shoes</strong> — lace up something you love to move in!</li>
            <li>💧 <strong>Water</strong> — hydration is self-love, bring a bottle!</li>
            <li>🧘 <strong>Yoga mat</strong> — if you have one, bring it for our floor practice.</li>
            <li>🧖 <strong>Towel</strong> — we promise you'll need it, this class is joyful AND sweaty!</li>
          </ul>
          <p>If you need to cancel, please email us at <a href="mailto:info@strongme.pro">info@strongme.pro</a>.</p>
          <p><a href="https://www.strongme.pro/my-bookings">Check your bookings and 6-pack status →</a></p>
          <p>Cheers,<br/>StrongME team</p>
        </div>
      `,
      attachments: [
        {
          filename: "strongme-class.ics",
          content: icsContent,
          contentType: "text/calendar; method=REQUEST",
        },
      ],
    });

    // 2) Notification email to StrongME
    const adminSixpackNote =
      sixpackStatus === "none"
        ? "Single class booking."
        : sixpackStatus === "used"
        ? `6-Pack entry used. Remaining: ${newSixpackRemaining}`
        : `⚠️ Last 6-pack entry used — customer needs to arrange new payment.`;

    await transporter.sendMail({
      from: `StrongME <${process.env.EMAIL_FROM}>`,
      to: "info@strongme.pro",
      subject: sixpackStatus === "last_used"
        ? "New booking — ⚠️ Last 6-pack entry used"
        : "New StrongME booking",
      text: `New class booking.\n\nCustomer: ${trimmedEmail}\nDate: ${formattedDate}\n${adminSixpackNote}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New StrongME booking</h2>
          <p><strong>Customer:</strong> ${trimmedEmail}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Type:</strong> ${adminSixpackNote}</p>
        </div>
      `,
    });

    // Redis updates after successful emails
    await redis.incr(dateKey);

    if (sixpackStatus !== "none") {
      await redis.set(sixpackKey, newSixpackRemaining);
    }

    const bookingsKey = `user:bookings:${normalizedEmail}`;
    const existingRaw = (await redis.get<string>(bookingsKey)) ?? "[]";
    const existingBookings = JSON.parse(existingRaw);
    existingBookings.push({
      date,
      type: sixpackStatus !== "none" ? "sixpack" : "single",
      bookedAt: new Date().toISOString(),
    });
    await redis.set(bookingsKey, JSON.stringify(existingBookings));
    await redis.sadd("all:emails", normalizedEmail);

    return res.status(200).json({
      success: true,
      message: "Emails sent successfully!",
    });
  } catch (error: any) {
    console.error("Email sending failed:", error);

    const isDev = process.env.NODE_ENV !== "production";
    return res.status(500).json({
      success: false,
      error: "EMAIL_SEND_FAILED",
      message: "Failed to send email.",
      ...(isDev && { debug: error?.message ?? String(error) }),
    });
  }
}
