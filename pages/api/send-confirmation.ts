import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

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

What to bring:
👟 Sports shoes — lace up something you love to move in!
💧 Water — hydration is self-love, bring a bottle!
🧘 Yoga mat — if you have one, bring it for our floor practice.
🌟 Towel — we promise you'll need it, this class is joyful AND sweaty!

If you need to cancel, please email us at info@strongme.pro.

Cheers,
StrongME team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>StrongME Class Booking Confirmation</h2>
          <p>Thank you for booking your StrongME class.</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> 10:30 AM</p>
          <p><strong>Location:</strong> Otto-Schütz-Weg 9, 8050 Zurich</p>
          <p><strong>What to bring:</strong></p>
          <ul>
            <li>👟 <strong>Sports shoes</strong> — lace up something you love to move in!</li>
            <li>💧 <strong>Water</strong> — hydration is self-love, bring a bottle!</li>
            <li>🧘 <strong>Yoga mat</strong> — if you have one, bring it for our floor practice.</li>
            <li>🌟 <strong>Towel</strong> — we promise you'll need it, this class is joyful AND sweaty!</li>
          </ul>
          <p>If you need to cancel, please email us at <a href="mailto:info@strongme.pro">info@strongme.pro</a>.</p>
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
    await transporter.sendMail({
      from: `StrongME <${process.env.EMAIL_FROM}>`,
      to: "info@strongme.pro",
      subject: "New StrongME booking",
      text: `A new class booking was made.

Customer email: ${trimmedEmail}
Booked date: ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New StrongME booking</h2>
          <p><strong>Customer email:</strong> ${trimmedEmail}</p>
          <p><strong>Booked date:</strong> ${formattedDate}</p>
        </div>
      `,
    });

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