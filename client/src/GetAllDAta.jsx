
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const API = "http://localhost:5000/api";

function GetAllDAta() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [selected, setSelected] = useState(null);

  async function loadFeedback() {
    try {
      setError("");
      const response = await axios.get(`${API}/getfeedback`);
      setFeedbacks(response.data);
    } catch (err) {
      setError("Cannot connect to the backend. Please start the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  const departments = useMemo(
    () => [
      "All",
      ...new Set(feedbacks.map((item) => item.q2).filter(Boolean)),
    ],
    [feedbacks]
  );

  const filtered = useMemo(() => {
    return feedbacks.filter((item) => {
      const term = search.toLowerCase();

      const matchesSearch = [
        item.q1,
        item.q2,
        item.q3,
        item.q4,
        item.q5,
      ].some((value) => String(value || "").toLowerCase().includes(term));

      const matchesDepartment =
        department === "All" || item.q2 === department;

      return matchesSearch && matchesDepartment;
    });
  }, [feedbacks, search, department]);

  const today = new Date().toDateString();

  const todayCount = feedbacks.filter(
    (item) => new Date(item.submittedAt).toDateString() === today
  ).length;

  const ratedFeedbacks = feedbacks.filter(
    (item) => Number(item.rating) > 0
  );

  const averageRating = ratedFeedbacks.length
    ? (
        ratedFeedbacks.reduce(
          (total, item) => total + Number(item.rating),
          0
        ) / ratedFeedbacks.length
      ).toFixed(1)
    : "0.0";

  function exportCSV() {
    const headers = [
      "Name",
      "Department",
      "Session",
      "Rating",
      "Feedback",
      "Suggestions",
      "Submitted At",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filtered.map((item) => [
      item.q1,
      item.q2,
      item.q3,
      item.rating,
      item.q4,
      item.q5,
      item.submittedAt
        ? new Date(item.submittedAt).toLocaleString()
        : "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "survey-feedback.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <a className="brand dashboard-brand" href="/">
          Pulse<span>Survey</span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        <a className="sidebar-link active" href="/getAllData">
          <span>▦</span> Overview
        </a>

        <a className="sidebar-link" href="/">
          <span>✎</span> Feedback Form
        </a>

        <button className="sidebar-link sidebar-refresh" onClick={loadFeedback}>
          <span>↻</span> Refresh Data
        </button>

        <div className="sidebar-bottom">
          <div className="admin-avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>Survey dashboard</small>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">SURVEY ANALYTICS</span>
            <h1>Admin Dashboard</h1>
            <p>Track responses and understand participant feedback.</p>
          </div>
          <a className="dashboard-form-link" href="/">
            + Open Survey
          </a>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}
            <button onClick={loadFeedback}>Try again</button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Total Responses</p>
            <h2>{loading ? "—" : feedbacks.length}</h2>
            <small>All submitted surveys</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">↗</div>
            <p>Today's Responses</p>
            <h2>{loading ? "—" : todayCount}</h2>
            <small>Submitted today</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">★</div>
            <p>Average Rating</p>
            <h2>{loading ? "—" : `${averageRating}/5`}</h2>
            <small>{ratedFeedbacks.length} rated responses</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">♧</div>
            <p>Departments</p>
            <h2>{loading ? "—" : departments.length - 1}</h2>
            <small>Unique departments</small>
          </div>
        </section>

        <section className="responses-panel">
          <div className="responses-heading">
            <div>
              <h2>Survey Responses</h2>
              <p>Review the feedback submitted by participants.</p>
            </div>
            <button className="export-button" onClick={exportCSV}>
              ↓ Export CSV
            </button>
          </div>

          <div className="table-tools">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, session or feedback..."
              aria-label="Search feedback"
            />

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              aria-label="Filter by department"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading responses...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span>▤</span>
              <h3>No responses found</h3>
              <p>
                {feedbacks.length === 0
                  ? "Submit a survey from the home page to see responses here."
                  : "Try changing your search or department filter."}
              </p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="response-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Department</th>
                    <th>Session</th>
                    <th>Rating</th>
                    <th>Submitted</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="participant">
                          <span className="participant-avatar">
                            {(item.q1 || "?").charAt(0).toUpperCase()}
                          </span>
                          <strong>{item.q1 || "Anonymous"}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="department-tag">
                          {item.q2 || "—"}
                        </span>
                      </td>
                      <td>{item.q3 || "—"}</td>
                      <td>
                        <span className="table-rating">
                          ★ {item.rating || "N/A"}
                        </span>
                      </td>
                      <td>
                        {item.submittedAt
                          ? new Date(item.submittedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <button
                          className="view-button"
                          onClick={() => setSelected(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-footer">
            Showing {filtered.length} of {feedbacks.length} responses
          </div>
        </section>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <section
              className="feedback-modal details-modal"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-button"
                onClick={() => setSelected(null)}
              >
                ×
              </button>

              <span className="eyebrow">RESPONSE DETAILS</span>
              <h2>{selected.q1 || "Anonymous"}</h2>
              <p className="detail-meta">
                {selected.q2 || "No department"} ·{" "}
                {selected.submittedAt
                  ? new Date(selected.submittedAt).toLocaleString()
                  : "Date unavailable"}
              </p>

              <div className="detail-field">
                <small>Session title</small>
                <p>{selected.q3 || "Not provided"}</p>
              </div>

              <div className="detail-field">
                <small>Rating</small>
                <p>
                  {"★".repeat(Number(selected.rating) || 0)}
                  {"☆".repeat(5 - (Number(selected.rating) || 0))}
                  {" "}
                  ({selected.rating || 0}/5)
                </p>
              </div>

              <div className="detail-field">
                <small>Feedback</small>
                <p>{selected.q4 || "Not provided"}</p>
              </div>

              <div className="detail-field">
                <small>Suggestions</small>
                <p>{selected.q5 || "Not provided"}</p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default GetAllDAta;
