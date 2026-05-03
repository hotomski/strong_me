"use client";

import { useState } from "react";
import Link from "next/link";

type Payment = {
  id: string;
  email: string;
  type: "single" | "sixpack";
  amount: number;
  date: string;
  note: string;
};

type PaymentsData = {
  payments: Payment[];
  total: number;
  totalPages: number;
  currentPage: number;
  totalAmount: number;
};

const FILTERS = [
  { key: "1m", label: "Last month" },
  { key: "3m", label: "Last 3 months" },
  { key: "6m", label: "Last 6 months" },
  { key: "1y", label: "Last year" },
  { key: "all", label: "All time" },
];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-CH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PaymentsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [data, setData] = useState<PaymentsData | null>(null);
  const [filter, setFilter] = useState("3m");
  const [loading, setLoading] = useState(false);

  const fetchPayments = async (f: string, page: number, pwd = password) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter: f, page, password: pwd }),
      });
      const json = await res.json();
      if (json.success) setData(json);
    } catch {}
    setLoading(false);
  };

  const login = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter: "3m", page: 1, password }),
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
      setAuthLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <h1 className="admin-login-title">Payment History</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="admin-input"
          />
          {authError && <p className="admin-error">{authError}</p>}
          <button className="btn btn-primary" onClick={login} disabled={authLoading}>
            {authLoading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <span className="admin-nav-title">Payment History</span>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/admin" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 600 }}>
            ← Admin
          </Link>
          <button
            className="admin-nav-logout"
            onClick={() => { setAuthed(false); setPassword(""); setData(null); }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="admin-main">
        <section className="admin-section">

          <div className="admin-filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`admin-filter-tab ${filter === f.key ? "admin-filter-tab-active" : ""}`}
                onClick={() => {
                  setFilter(f.key);
                  fetchPayments(f.key, 1);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {data && (
            <div className="admin-payments-summary">
              <span><strong>{data.total}</strong> {data.total === 1 ? "payment" : "payments"}</span>
              <span className="admin-payments-total"><strong>{data.totalAmount} CHF</strong> total</span>
            </div>
          )}

          {loading ? (
            <p className="admin-empty">Loading...</p>
          ) : data && data.payments.length > 0 ? (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.date)}</td>
                      <td>{p.email}</td>
                      <td>{p.type === "sixpack" ? "6-Pack" : "Single"}</td>
                      <td>{p.amount} CHF</td>
                      <td>{p.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    className="admin-page-btn"
                    disabled={data.currentPage <= 1}
                    onClick={() => fetchPayments(filter, data.currentPage - 1)}
                  >
                    ← Previous
                  </button>
                  <span className="admin-page-info">
                    Page {data.currentPage} of {data.totalPages}
                  </span>
                  <button
                    className="admin-page-btn"
                    disabled={data.currentPage >= data.totalPages}
                    onClick={() => fetchPayments(filter, data.currentPage + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="admin-empty">No payments found for this period.</p>
          )}
        </section>
      </main>
    </div>
  );
}
