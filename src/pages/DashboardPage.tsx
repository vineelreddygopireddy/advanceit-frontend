import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { WeeklyTimesheet } from "../types/timesheet";
import {
  formatDate,
  getWeekStart,
  MOCK_TIMESHEETS,
  MOCK_PROJECT,
} from "../utils/timesheetUtils";
import TimesheetEntryModal from "../components/TimesheetEntryModal";
import "../styles/dashboard.css";

type StatusFilter = "All" | WeeklyTimesheet["status"];

function badgeClass(status: WeeklyTimesheet["status"]) {
  return {
    PENDING: "badge badge-pending",
    APPROVED: "badge badge-approved",
    REJECTED: "badge badge-rejected",
    SAVED: "badge badge-saved",
  }[status];
}

// Next unfilled week starting Aug 1 2026
const AUG_1 = new Date("2026-08-01");
const FIRST_WEEK = getWeekStart(AUG_1);

function DashboardPage() {
  const [sheets, setSheets] = useState<WeeklyTimesheet[]>(MOCK_TIMESHEETS);
  const [showModal, setShowModal] = useState(false);
  const [activeWeek, setActiveWeek] = useState<Date>(FIRST_WEEK);

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("2026-05-16");
  const [toDate, setToDate] = useState("2026-10-11");

  const filtered = useMemo(() => {
    return sheets.filter((s) => {
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      if (fromDate && s.weekStartDate < fromDate) return false;
      if (toDate && s.weekStartDate > toDate) return false;
      if (searchText && !s.id.toLowerCase().includes(searchText.toLowerCase()))
        return false;
      return true;
    });
  }, [sheets, statusFilter, searchText, fromDate, toDate]);

  function handleSave(sheet: WeeklyTimesheet) {
    setSheets((prev) => [sheet, ...prev]);
  }

  const approved = sheets.filter((s) => s.status === "APPROVED");
  const totalApprovedHours = approved.reduce((s, t) => s + t.totalST, 0);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <header className="navbar">
        <Link to="/" className="brand">
          AdvanceIt Technologies
        </Link>
        <nav className="nav-links" style={{ gap: 24 }}>
          <a href="#timesheets">Timesheets</a>
          <a href="#project">My Project</a>
        </nav>
        <div className="nav-actions">
          <Link
            to="/"
            className="button button-outline"
            style={{ fontSize: "0.88rem", padding: "10px 18px" }}
          >
            Log out
          </Link>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Greeting */}
        <div className="dash-topbar">
          <div className="dash-greeting">
            <h2>Welcome back 👋</h2>
            <p>Here's your activity overview at AdvanceIt Technologies.</p>
          </div>
          <button
            className="button button-primary"
            onClick={() => {
              setActiveWeek(FIRST_WEEK);
              setShowModal(true);
            }}
          >
            + Enter Timesheet
          </button>
        </div>

        {/* Summary cards */}
        <div className="dash-cards">
          <div className="dash-card">
            <p className="dash-card-label">Total Timesheets</p>
            <p className="dash-card-value">{sheets.length}</p>
          </div>
          <div className="dash-card">
            <p className="dash-card-label">Approved</p>
            <p className="dash-card-value">
              {sheets.filter((s) => s.status === "APPROVED").length}
            </p>
          </div>
          <div className="dash-card">
            <p className="dash-card-label">Pending Review</p>
            <p className="dash-card-value">
              {sheets.filter((s) => s.status === "PENDING").length}
            </p>
          </div>
          <div className="dash-card">
            <p className="dash-card-label">Hours Logged</p>
            <p className="dash-card-value">{totalApprovedHours}</p>
            <p className="dash-card-sub">approved hours</p>
          </div>
        </div>

        {/* Assigned project */}
        <div className="project-card" id="project">
          <div className="project-card-header">
            <div>
              <h3>{MOCK_PROJECT.name}</h3>
              <p>Client: {MOCK_PROJECT.client}</p>
            </div>
            <div className="project-meta">
              <span className="meta-chip">{MOCK_PROJECT.status}</span>
              <span className="meta-chip">
                {MOCK_PROJECT.timesheetFrequency}
              </span>
            </div>
          </div>
          <div className="project-detail-grid">
            <div className="project-detail-item">
              <p className="label">Project ID</p>
              <p className="value">{MOCK_PROJECT.id}</p>
            </div>
            <div className="project-detail-item">
              <p className="label">Supervisor</p>
              <p className="value">{MOCK_PROJECT.supervisor}</p>
            </div>
            <div className="project-detail-item">
              <p className="label">Department</p>
              <p className="value">{MOCK_PROJECT.department}</p>
            </div>
            <div className="project-detail-item">
              <p className="label">Location</p>
              <p className="value">{MOCK_PROJECT.location}</p>
            </div>
            <div className="project-detail-item">
              <p className="label">Start Date</p>
              <p className="value">{formatDate(MOCK_PROJECT.startDate)}</p>
            </div>
            <div className="project-detail-item">
              <p className="label">End Date</p>
              <p className="value">
                {MOCK_PROJECT.endDate
                  ? formatDate(MOCK_PROJECT.endDate)
                  : "Ongoing"}
              </p>
            </div>
          </div>
        </div>

        {/* Timesheets table */}
        <div className="ts-section" id="timesheets">
          <div className="ts-section-header">
            <div>
              <h3>Time Sheets</h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text)",
                  marginTop: 4,
                }}
              >
                Period
              </p>
            </div>
            <span className="ts-item-count">{filtered.length} Items Found</span>
          </div>

          {/* Date filters */}
          <div className="ts-filters">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              aria-label="From date"
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              aria-label="To date"
            />
            <button
              className="button button-primary"
              style={{ padding: "10px 20px", fontSize: "0.9rem" }}
              onClick={() => {}}
            >
              Apply Filters
            </button>
          </div>

          <div className="ts-table-wrap">
            <table className="ts-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>ID</th>
                  <th>Revision</th>
                  <th>Main Document</th>
                  <th>Client</th>
                  <th>Supervisor</th>
                  <th>Start Date</th>
                  <th>End</th>
                  <th className="num">ST</th>
                  <th className="num">OT</th>
                  <th className="num">DT</th>
                  <th className="num">Others</th>
                  <th className="num">NB</th>
                </tr>
              </thead>
              <tbody>
                {/* Filter row */}
                <tr className="ts-filter-row">
                  <td>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as StatusFilter)
                      }
                      aria-label="Filter by status"
                    >
                      <option>All</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="SAVED">Saved</option>
                    </select>
                  </td>
                  <td colSpan={12}>
                    <input
                      type="text"
                      placeholder="Enter Criteria…"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ maxWidth: "220px" }}
                    />
                  </td>
                </tr>

                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
                      style={{
                        textAlign: "center",
                        padding: "32px",
                        color: "var(--text)",
                      }}
                    >
                      No timesheets match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sheet) => (
                    <tr key={sheet.id}>
                      <td>
                        <span className={badgeClass(sheet.status)}>
                          {sheet.status === "APPROVED"
                            ? "✔ "
                            : sheet.status === "PENDING"
                              ? "⚠ "
                              : ""}
                          {sheet.status.charAt(0) +
                            sheet.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td>
                        <button className="ts-id-link">{sheet.id}</button>
                      </td>
                      <td>{sheet.revision}</td>
                      <td>{MOCK_PROJECT.id}…</td>
                      <td>{MOCK_PROJECT.client.slice(0, 12)}…</td>
                      <td>{MOCK_PROJECT.supervisor}</td>
                      <td>{formatDate(sheet.weekStartDate)}</td>
                      <td>{formatDate(sheet.weekEndDate)}</td>
                      <td className="num">{sheet.totalST.toFixed(2)}</td>
                      <td className="num">{sheet.totalOT.toFixed(2)}</td>
                      <td className="num">{sheet.totalDT.toFixed(2)}</td>
                      <td className="num">{sheet.totalOthers.toFixed(2)}</td>
                      <td className="num">{sheet.totalNB.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="ts-table-footer">
              <div style={{ display: "flex", gap: 20 }}>
                <button
                  className="clear-btn"
                  onClick={() => {
                    setStatusFilter("All");
                    setSearchText("");
                  }}
                >
                  Clear Sort
                </button>
                <button
                  className="clear-btn"
                  onClick={() => {
                    setFromDate("2026-05-16");
                    setToDate("2026-10-11");
                    setStatusFilter("All");
                    setSearchText("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
              <span className="ts-item-count">
                {filtered.length} of {sheets.length} records
              </span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <TimesheetEntryModal
          weekStart={activeWeek}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default DashboardPage;
