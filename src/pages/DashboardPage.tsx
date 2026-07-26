import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, employeesApi, projectsApi, timesheetsApi } from "../api/api";
import type { ProjectResponse, TimesheetResponse } from "../api/api";
import type { WeeklyTimesheet } from "../types/timesheet";
import {
  DAYS,
  getWeekEnd,
  formatDate,
  getWeekStart,
  toISODate,
  emptyDays,
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

type WeeklyDetails = {
  weekStartDate?: string;
  weekEndDate?: string;
  days?: WeeklyTimesheet["days"];
  totals?: {
    st?: number;
    ot?: number;
    dt?: number;
    others?: number;
    nb?: number;
  };
};

function mapTimesheetResponse(item: TimesheetResponse): WeeklyTimesheet {
  const details = (item.details ?? {}) as WeeklyDetails;
  const entry = new Date(item.entryDate);
  const inferredWeekStart = getWeekStart(entry);
  const weekStartDate = details.weekStartDate ?? toISODate(inferredWeekStart);
  const weekEndDate =
    details.weekEndDate ?? toISODate(getWeekEnd(inferredWeekStart));
  const days = details.days ?? emptyDays();

  const totalST =
    details.totals?.st ??
    DAYS.reduce((sum, day) => sum + (days[day]?.st ?? 0), 0);
  const totalOT =
    details.totals?.ot ??
    DAYS.reduce((sum, day) => sum + (days[day]?.ot ?? 0), 0);
  const totalDT =
    details.totals?.dt ??
    DAYS.reduce((sum, day) => sum + (days[day]?.dt ?? 0), 0);
  const totalOthers =
    details.totals?.others ??
    DAYS.reduce((sum, day) => sum + (days[day]?.others ?? 0), 0);
  const totalNB = details.totals?.nb ?? 0;

  return {
    id: item.id,
    weekStartDate,
    weekEndDate,
    status: (item.status as WeeklyTimesheet["status"]) ?? "SAVED",
    revision: 0,
    days,
    totalST,
    totalOT,
    totalDT,
    totalOthers,
    totalNB,
  };
}

function DashboardPage() {
  const navigate = useNavigate();
  const [sheets, setSheets] = useState<WeeklyTimesheet[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeWeek, setActiveWeek] = useState<Date>(FIRST_WEEK);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string>("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("2026-05-16");
  const [toDate, setToDate] = useState("2026-10-11");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function loadAllTimesheets(currentEmployeeId: string) {
    const rows = await timesheetsApi.getForEmployee(currentEmployeeId);
    const mapped = rows
      .map(mapTimesheetResponse)
      .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
    setSheets(mapped);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setApiError("");

        const profile = await employeesApi.getMyProfile();
        if (cancelled) {
          return;
        }
        setEmployeeId(profile.id);

        const [projects, timesheets] = await Promise.all([
          projectsApi.getAll(),
          timesheetsApi.getForEmployee(profile.id),
        ]);

        if (cancelled) {
          return;
        }

        const assignedProject =
          projects.find((p) =>
            p.assignments?.some((a) => a.employeeId === profile.id),
          ) ??
          projects[0] ??
          null;

        setProject(assignedProject);
        setSheets(
          timesheets
            .map(mapTimesheetResponse)
            .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate)),
        );
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data from API";
        setApiError(message);

        // Keep UI usable when backend is unavailable.
        setSheets(MOCK_TIMESHEETS);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

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

  async function handleSave(payload: {
    status: "SAVED" | "PENDING";
    weekStartDate: string;
    weekEndDate: string;
    days: WeeklyTimesheet["days"];
    totalST: number;
    totalOT: number;
    totalDT: number;
    totalOthers: number;
    totalNB: number;
  }) {
    if (!employeeId || !project) {
      throw new Error("Employee profile or project assignment is missing");
    }

    const created = await timesheetsApi.create({
      employeeId,
      projectId: project.id,
      entryDate: payload.weekStartDate,
      status: payload.status,
      details: {
        weekStartDate: payload.weekStartDate,
        weekEndDate: payload.weekEndDate,
        days: payload.days,
        totals: {
          st: payload.totalST,
          ot: payload.totalOT,
          dt: payload.totalDT,
          others: payload.totalOthers,
          nb: payload.totalNB,
        },
      },
    });

    setSheets((prev) => [mapTimesheetResponse(created), ...prev]);
  }

  async function handleApplyDateRange() {
    if (!employeeId) {
      return;
    }

    try {
      setApiError("");
      const rows = await timesheetsApi.getForEmployeeDateRange(
        employeeId,
        fromDate,
        toDate,
      );
      setSheets(
        rows
          .map(mapTimesheetResponse)
          .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate)),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to filter timesheets";
      setApiError(message);
    }
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
    } catch {
      // Session is cleared in authApi.logout finally block.
    } finally {
      setIsLoggingOut(false);
      navigate("/login");
    }
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
          <button
            type="button"
            className="button button-outline"
            style={{ fontSize: "0.88rem", padding: "10px 18px" }}
            onClick={() => {
              void handleLogout();
            }}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
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
              <h3>{project?.projectName ?? MOCK_PROJECT.name}</h3>
              <p>Client: {project?.clientName ?? MOCK_PROJECT.client}</p>
            </div>
            <div className="project-meta">
              <span className="meta-chip">
                {project ? "ACTIVE" : MOCK_PROJECT.status}
              </span>
              <span className="meta-chip">
                {MOCK_PROJECT.timesheetFrequency}
              </span>
            </div>
          </div>
          <div className="project-detail-grid">
            <div className="project-detail-item">
              <p className="label">Project ID</p>
              <p className="value">{project?.id ?? MOCK_PROJECT.id}</p>
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
              <p className="value">
                {formatDate(project?.startDate ?? MOCK_PROJECT.startDate)}
              </p>
            </div>
            <div className="project-detail-item">
              <p className="label">End Date</p>
              <p className="value">
                {project?.endDate ? formatDate(project.endDate) : "Ongoing"}
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

          {isLoading && (
            <p style={{ color: "var(--text)", fontSize: "0.9rem" }}>
              Loading timesheets...
            </p>
          )}

          {apiError && (
            <p style={{ color: "#c53030", fontSize: "0.9rem" }}>{apiError}</p>
          )}

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
              onClick={() => {
                void handleApplyDateRange();
              }}
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
                      <td>{project?.clientId ?? MOCK_PROJECT.id}…</td>
                      <td>
                        {(project?.clientName ?? MOCK_PROJECT.client).slice(
                          0,
                          12,
                        )}
                        …
                      </td>
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
                    if (employeeId) {
                      void loadAllTimesheets(employeeId);
                    }
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
          projectName={project?.projectName ?? MOCK_PROJECT.name}
          clientName={project?.clientName ?? MOCK_PROJECT.client}
          supervisor={MOCK_PROJECT.supervisor}
        />
      )}
    </div>
  );
}

export default DashboardPage;
