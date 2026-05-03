"use client";

import Link from "next/link";
import { useState } from "react";

type Booking = {
  date: string;
  type: "single" | "sixpack";
  bookedAt: string;
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isPast(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export default function MyBookings() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ bookings: Booking[]; sixpackRemaining: number } | null>(null);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/user/bookings?email=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError("Could not load bookings. Please try again.");
      }
    } catch {
      setError("Could not load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const upcoming = data?.bookings.filter((b) => !isPast(b.date)) ?? [];
  const past = data?.bookings.filter((b) => isPast(b.date)) ?? [];

  return (
    <div className="site-shell">
      <nav className="corp-nav">
        <Link href="/" className="corp-nav-logo">StrongME</Link>
        <Link href="/" className="corp-nav-link">← Back to StrongME</Link>
      </nav>

      <main className="page">
        <section className="content-section">
          <div className="section-label">
            <h2>My Bookings</h2>
          </div>

          <div className="section-content">
            <p className="lead-paragraph">Enter your email to see your bookings and 6-pack status.</p>

            <div className="lookup-form">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                disabled={loading}
                className="lookup-input"
              />
              <button
                className="btn btn-primary"
                onClick={handleLookup}
                disabled={loading || !email.trim()}
              >
                {loading ? "Loading..." : "Look up"}
              </button>
            </div>

            {error && <p className="lookup-error">{error}</p>}

            {data && (
              <div className="lookup-results">
                {/* 6-pack status */}
                <div className={`sixpack-card ${data.sixpackRemaining > 0 ? "sixpack-card-active" : "sixpack-card-empty"}`}>
                  <span className="sixpack-card-label">6-Pack Status</span>
                  {data.sixpackRemaining > 0 ? (
                    <>
                      <span className="sixpack-card-count">{data.sixpackRemaining}</span>
                      <span className="sixpack-card-sub">{data.sixpackRemaining === 1 ? "entry remaining" : "entries remaining"}</span>
                    </>
                  ) : (
                    <span className="sixpack-card-sub">No active 6-pack</span>
                  )}
                </div>

                {/* Upcoming bookings */}
                {upcoming.length > 0 && (
                  <div className="bookings-group">
                    <h3 className="bookings-group-title">Upcoming</h3>
                    {upcoming.map((b) => (
                      <div key={b.date + b.bookedAt} className="booking-row booking-row-upcoming">
                        <span className="booking-date">{formatDate(b.date)}</span>
                        <span className={`booking-badge ${b.type === "sixpack" ? "badge-sixpack" : "badge-single"}`}>
                          {b.type === "sixpack" ? "6-Pack" : "Single"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Past bookings */}
                {past.length > 0 && (
                  <div className="bookings-group">
                    <h3 className="bookings-group-title">Past classes</h3>
                    {past.map((b) => (
                      <div key={b.date + b.bookedAt} className="booking-row booking-row-past">
                        <span className="booking-date">{formatDate(b.date)}</span>
                        <span className={`booking-badge ${b.type === "sixpack" ? "badge-sixpack" : "badge-single"}`}>
                          {b.type === "sixpack" ? "6-Pack" : "Single"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {data.bookings.length === 0 && (
                  <p>No bookings found for this email.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
