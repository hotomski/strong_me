"use client";

import { useState } from "react";
import { AVAILABLE_DATES_ARRAY } from "@/lib/constants";

type User = {
  email: string;
  sixpackRemaining: number;
  bookingCount: number;
  lastBooking: string | null;
};

type DashboardData = {
  classCounts: Record<string, number>;
  users: User[];
};

type UserBooking = {
  date: string;
  type: string;
  bookedAt: string;
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-CH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function isUpcoming(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date >= today;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  // Assign sixpack form
  const [assignEmail, setAssignEmail] = useState("");
  const [assignEntries, setAssignEntries] = useState("6");
  const [assignStatus, setAssignStatus] = useState("");

  // User lookup
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupData, setLookupData] = useState<{ bookings: UserBooking[]; sixpackRemaining: number } | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
        setAuthed(true);
      } else {
        setAuthError("Incorrect password.");
      }
    } catch {
      setAuthError("Could not connect. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    const res = await fetch("/api/admin/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (json.success) setData(json);
  };

  const assignSixpack = async () => {
    if (!assignEmail.trim()) return;
    setAssignStatus("");
    try {
      const res = await fetch("/api/admin/assign-sixpack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: assignEmail, entries: Number(assignEntries), password }),
      });
      const json = await res.json();
      if (json.success) {
        setAssignStatus(`✓ Assigned ${json.entries} entries to ${json.email}`);
        setAssignEmail("");
        setAssignEntries("6");
        refreshDashboard();
      } else {
        setAssignStatus("Error assigning 6-pack.");
      }
    } catch {
      setAssignStatus("Error assigning 6-pack.");
    }
  };

  const lookupUser = async () => {
    if (!lookupEmail.trim()) return;
    setLookupLoading(true);
    setLookupData(null);
    try {
      const res = await fetch(`/api/user/bookings?email=${encodeURIComponent(lookupEmail.trim())}`);
      const json = await res.json();
      if (json.success) setLookupData(json);
    } catch {}
    setLookupLoading(false);
  };

  if (!authed) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <h1 className="admin-login-title">StrongME Admin</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="admin-input"
          />
          {authError && <p className="admin-error">{authError}</p>}
          <button className="btn btn-primary" onClick={login} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    );
  }

  const upcomingDates = AVAILABLE_DATES_ARRAY.filter(isUpcoming);
  const pastDates = AVAILABLE_DATES_ARRAY.filter((d) => !isUpcoming(d)).reverse();

  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <span className="admin-nav-title">StrongME Admin</span>
        <button className="admin-nav-logout" onClick={() => { setAuthed(false); setPassword(""); setData(null); }}>
          Sign out
        </button>
      </nav>

      <main className="admin-main">

        {/* Upcoming classes */}
        <section className="admin-section">
          <h2 className="admin-section-title">Upcoming classes</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Booked</th>
                <th>Spots left</th>
              </tr>
            </thead>
            <tbody>
              {upcomingDates.map((d) => {
                const count = data?.classCounts[d] ?? 0;
                return (
                  <tr key={d}>
                    <td>{formatDate(d)}</td>
                    <td>{count} / 10</td>
                    <td>{10 - count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Assign 6-pack */}
        <section className="admin-section">
          <h2 className="admin-section-title">Assign 6-pack</h2>
          <div className="admin-form-row">
            <input
              type="email"
              placeholder="Customer email"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              className="admin-input admin-input-wide"
            />
            <select
              value={assignEntries}
              onChange={(e) => setAssignEntries(e.target.value)}
              className="admin-input admin-select"
            >
              {[1,2,3,4,5,6].map((n) => (
                <option key={n} value={n}>{n} {n === 6 ? "(full 6-pack)" : n === 1 ? "entry" : "entries"}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={assignSixpack}>Assign</button>
          </div>
          {assignStatus && <p className="admin-status">{assignStatus}</p>}
        </section>

        {/* Users */}
        <section className="admin-section">
          <h2 className="admin-section-title">All customers</h2>
          {data && data.users.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>6-Pack left</th>
                  <th>Total bookings</th>
                  <th>Last booking</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.email} className={u.sixpackRemaining > 0 ? "admin-row-sixpack" : ""}>
                    <td>{u.email}</td>
                    <td>{u.sixpackRemaining > 0 ? `${u.sixpackRemaining} entries` : "—"}</td>
                    <td>{u.bookingCount}</td>
                    <td>{u.lastBooking ? formatDate(u.lastBooking) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-empty">No customers yet.</p>
          )}
        </section>

        {/* User lookup */}
        <section className="admin-section">
          <h2 className="admin-section-title">Look up customer</h2>
          <div className="admin-form-row">
            <input
              type="email"
              placeholder="Customer email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupUser()}
              className="admin-input admin-input-wide"
            />
            <button className="btn btn-primary" onClick={lookupUser} disabled={lookupLoading}>
              {lookupLoading ? "Loading..." : "Look up"}
            </button>
          </div>
          {lookupData && (
            <div className="admin-lookup-result">
              <p><strong>6-Pack remaining:</strong> {lookupData.sixpackRemaining > 0 ? `${lookupData.sixpackRemaining} entries` : "None"}</p>
              <p><strong>Total bookings:</strong> {lookupData.bookings.length}</p>
              {lookupData.bookings.length > 0 && (
                <table className="admin-table admin-table-sm">
                  <thead>
                    <tr><th>Date</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    {lookupData.bookings.map((b) => (
                      <tr key={b.date + b.bookedAt}>
                        <td>{formatDate(b.date)}</td>
                        <td>{b.type === "sixpack" ? "6-Pack" : "Single"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>

        {/* Past classes */}
        <section className="admin-section">
          <h2 className="admin-section-title">Past classes</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Booked</th></tr>
            </thead>
            <tbody>
              {pastDates.map((d) => (
                <tr key={d}>
                  <td>{formatDate(d)}</td>
                  <td>{data?.classCounts[d] ?? 0} / 10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}
