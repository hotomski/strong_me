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

  const bookingDate = new Date(date);

  if (Number.isNaN(bookingDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: "INVALID_DATE",
      message: "Invalid booking date.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
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

    // 1) Confirmation email to the customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: trimmedEmail,
      subject: "StrongME Class Booking Confirmation",
      text: `Thank you for booking your StrongME class!

Details:
Date: ${formattedDate}

If you need to cancel, please email us at strongmeclass@gmail.com.

Cheers,
StrongME team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>StrongME Class Booking Confirmation</h2>
          <p>Thank you for booking your StrongME class.</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p>If you need to cancel, please email us at <a href="mailto:strongmeclass@gmail.com">strongmeclass@gmail.com</a>.</p>
          <p>Cheers,<br/>StrongME team</p>
        </div>
      `,
    });

    // 2) Notification email to StrongME
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "strongmeclass@gmail.com",
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