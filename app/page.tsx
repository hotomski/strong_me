"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

import type ReactDatePicker from "react-datepicker";
type DatePickerType = typeof ReactDatePicker;

const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default) as any,
  {
    ssr: false,
    loading: () => (
      <input type="text" placeholder="Select a Saturday or Sunday" disabled readOnly />
    ),
  }
) as unknown as DatePickerType;

const AVAILABLE_DATES = new Set([
  // April 2026
  "2026-04-04", "2026-04-12", "2026-04-18", "2026-04-25",
  // May 2026
  "2026-05-02", "2026-05-10", "2026-05-16", "2026-05-23", "2026-05-31",
  // June 2026
  "2026-06-06", "2026-06-13", "2026-06-21", "2026-06-27",
]);

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">();

  const isEmailValid = useMemo(() => {
    const trimmedEmail = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  }, [email]);

  const isFormValid = useMemo(() => {
    return Boolean(selectedDate && isEmailValid);
  }, [selectedDate, isEmailValid]);

  const resetModalState = () => {
    setSelectedDate(null);
    setEmail("");
    setIsSubmitting(false);
    setStatusMessage("");
    setStatusType("");
  };

  const openModal = () => {
    resetModalState();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    resetModalState();
  };

  const handleBooking = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const response = await fetch("/api/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          email: email.trim(),
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok && data?.success !== false) {
        setStatusType("success");
        setStatusMessage(
          "Booking confirmed! A confirmation email has been sent."
        );
      } else {
        setStatusType("error");

        if (data?.error === "INVALID_EMAIL") {
          setStatusMessage(
            "Class is not booked. The email address is invalid."
          );
        } else {
          setStatusMessage(
            "Class is not booked. The email address may be invalid or unreachable."
          );
        }
      }
    } catch {
      setStatusType("error");
      setStatusMessage(
        "Class is not booked. The email address may be invalid or unreachable."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-shell">
      <main className="page">
        {/* HERO */}
        <section className="hero-section">
          <div className="hero-copy">
            <p className="hero-eyebrow">Group Movement Class</p>

            <h1 className="hero-title">
              Strong body.
              <br />
              Strong mind.
              <br />
              Strong ME.
            </h1>

            <p className="hero-description">
              <span className="hero-description-strong">
                Rebuild your strength. Reclaim your power. Feel alive again.
              </span>{" "}
              Joyful strength and movement for your ME time — where music, play,
              connection, and conscious awareness come together.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={openModal}>
                Book your spot
              </button>
              <a href="#about" className="btn btn-secondary">
                Learn more
              </a>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-image-frame">
              <Image
                src="/images/strongME_New.png"
                alt="StrongME movement, connection and healing"
                fill
                priority
                className="hero-image"
                sizes="(min-width: 1024px) 52vw, 100vw"
              />
            </div>
          </div>
        </section>

        

        {/* ABOUT */}
        <section id="about" className="content-section section-divider">
          <div className="section-label">
            <h2>What is StrongME?</h2>
          </div>

          <div className="section-content">
            <p className="lead-paragraph">
              StrongME is structured, joyful movement training designed to
              rebuild strength, power, and stability during everyday and major
              life stress.
            </p>

            <p>
              Burnout. Anxiety. Birth. Illness. Loss. Career shifts. Ongoing
              workplace pressure. Name it. Then take your power back — and feel
              alive again.
            </p>

            <p>
              When stress overloads your system, your body does not need more
              pressure — it needs intelligent rebuilding. StrongME combines
              rhythmic cardio and strength training, playful movement with soft
              cloths and pom poms, and a guided closing practice of stretching,
              mindful breath, and embodied awareness to help you restore
              physical strength, stabilize stress responses, and rebuild
              sustainable energy.
            </p>

            <p className="quote-block">
              This is not where you carry it.
              <br />
              This is where you release it.
            </p>

            <p>
              We step onto the floor. We let the music lead. We dance. We play.
              We sweat. We laugh. We breathe deeper. We reconnect — to our
              bodies and to each other.
            </p>

            <p>
              You leave lighter. Clearer. Stronger. And unmistakably uplifted —
              your glow visible again.
            </p>

            <p className="closing-line">Strong body. Strong mind. Strong ME.</p>
          </div>
        </section>

        {/* FORMAT */}
        <section className="content-section">
          <div className="section-label">
            <h2>Class format</h2>
          </div>

          <div className="section-content section-content-tight">
            <FormatRow
              time="10 min"
              title="Warm-up & arrival"
              text="Gentle rhythm, joint mobility, body awareness, playful introduction."
            />
            <FormatRow
              time="35 min"
              title="Dance, play & strength"
              text="Joyful dance aerobics, movement with soft, playing cloths, functional strength."
            />
            <FormatRow
              time="15 min"
              title="Stretch & mindfulness"
              text="Slow stretches, breath, and a guided floor meditation to calm the nervous system."
            />
          </div>
        </section>

        {/* JOIN */}
        <section id="join" className="join-section section-divider">
          <div className="join-copy">
            <h2>Join us every Saturday / Sunday</h2>
            <p className="join-subline">
              Make this your time. Leave energized, empowered, and strong.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={openModal}>
                Book now
              </button>
              <a
                href="mailto:strongmeclass@gmail.com"
                className="btn btn-secondary"
              >
                strongmeclass@gmail.com
              </a>
            </div>
          </div>

          <div className="join-card">
            <div className="join-card-block">
              <span className="join-card-label">Schedule</span>
              <p>Every Saturday / Sunday · 10:30 AM</p>
              <p>Next class: 04.04.2026</p>
            </div>

            <div className="join-card-block">
              <span className="join-card-label">Price</span>
              <p>35 CHF — Single Class</p>
              <p>180 CHF — 6-Pack 😎</p>
            </div>

            <div className="join-card-block">
              <span className="join-card-label">Location</span>
              <p>Zentrum Elch ACCU</p>
              <p>Otto-Schütz-Weg 9, 8050 Zurich</p>
            </div>
          </div>
        </section>

        {/* MODAL */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Book Your Class</h3>

              {statusType !== "success" && (
                <>
                  <label>Select a Date:</label>

                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    dateFormat="MMMM d, yyyy"
                    filterDate={(date: Date) => AVAILABLE_DATES.has(toDateKey(date))}
                    placeholderText="Select a Saturday or Sunday"
                    disabled={isSubmitting}
                  />

                  <label>Email Address:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />

                  {email.trim().length > 0 && !isEmailValid && (
                    <div className="modal-feedback modal-feedback-error">
                      Please enter a valid email address.
                    </div>
                  )}
                </>
              )}

              {isSubmitting && (
                <div className="modal-feedback modal-feedback-loading">
                  <span className="spinner" aria-hidden="true" />
                  <span>Sending your booking...</span>
                </div>
              )}

              {!isSubmitting && statusMessage && (
                <div
                  className={`modal-feedback ${
                    statusType === "success"
                      ? "modal-feedback-success"
                      : "modal-feedback-error"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <div className="modal-actions">
                {statusType === "success" ? (
                  <button className="btn btn-primary" onClick={closeModal}>
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={closeModal}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={handleBooking}
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? "Booking..." : "Book class"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FormatRow({
  time,
  title,
  text,
}: {
  time: string;
  title: string;
  text: string;
}) {
  return (
    <div className="format-row">
      <div className="format-time">{time}</div>
      <div className="format-body">
        <p className="format-title">{title}</p>
        <p className="format-text">{text}</p>
      </div>
    </div>
  );
}