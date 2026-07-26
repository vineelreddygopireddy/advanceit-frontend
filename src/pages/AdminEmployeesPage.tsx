import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  adminApi,
  authApi,
  employeesApi,
  projectsApi,
  timesheetsApi,
} from "../api/api";
import type {
  EmployeeResponse,
  ProjectResponse,
  TimesheetResponse,
} from "../api/api";
import "../styles/admin.css";

type StatusFilter =
  | "ALL"
  | "AVAILABLE"
  | "PLACED"
  | "NOT_AVAILABLE"
  | "TRAINING";

type EmployeeRow = {
  employee: EmployeeResponse;
  projectName: string;
  clientName: string;
  statusLabel: string;
  weekStatusLabel: string;
  hoursThisMonth: number;
};

function formatShortDate(dateISO?: string | null) {
  if (!dateISO) {
    return "--";
  }
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) {
    return "--";
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "NA";
}

function parseHoursThisMonth(timesheets: TimesheetResponse[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return timesheets.reduce((sum, ts) => {
    const d = new Date(ts.entryDate);
    if (d.getMonth() !== month || d.getFullYear() !== year) {
      return sum;
    }

    const details = (ts.details ?? {}) as {
      totals?: { st?: number; ot?: number; dt?: number; others?: number };
    };

    const st = details.totals?.st ?? 0;
    const ot = details.totals?.ot ?? 0;
    const dt = details.totals?.dt ?? 0;
    const others = details.totals?.others ?? 0;
    return sum + st + ot + dt + others;
  }, 0);
}

function toStatusLabel(raw?: string | null) {
  if (!raw) {
    return "Unknown";
  }
  return raw
    .toLowerCase()
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function statusClass(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("available") || lower.includes("assigned")) {
    return "admin-pill admin-pill-green";
  }
  if (lower.includes("bgv") || lower.includes("training")) {
    return "admin-pill admin-pill-amber";
  }
  if (lower.includes("onboard")) {
    return "admin-pill admin-pill-blue";
  }
  if (lower.includes("hold") || lower.includes("not")) {
    return "admin-pill admin-pill-gray";
  }
  return "admin-pill";
}

function AdminEmployeesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [nameFilter, setNameFilter] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAssignedProjectId, setInviteAssignedProjectId] = useState("");
  const [inviteBillingStartDate, setInviteBillingStartDate] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteRoleEndDate, setInviteRoleEndDate] = useState("");
  const [inviteWorkMode, setInviteWorkMode] = useState("ONSITE");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectVendor, setProjectVendor] = useState("");
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [projectError, setProjectError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        setIsLoading(true);

        const [employees, projects] = await Promise.all([
          employeesApi.getAll(),
          projectsApi.getAll(),
        ]);

        const rowsData = await Promise.all(
          employees.map(async (employee) => {
            const assignedProject = projects.find((project) =>
              project.assignments?.some((a) => a.employeeId === employee.id),
            );

            let timesheets: TimesheetResponse[] = [];
            try {
              timesheets = await timesheetsApi.getForEmployee(employee.id);
            } catch {
              timesheets = [];
            }

            const latestStatus = timesheets[0]?.status
              ? toStatusLabel(timesheets[0].status)
              : "Not started";

            return {
              employee,
              projectName: assignedProject?.projectName ?? "--",
              clientName: assignedProject?.clientName ?? "--",
              statusLabel:
                toStatusLabel(employee.employeeStatus) || "Onboarding",
              weekStatusLabel: latestStatus,
              hoursThisMonth: parseHoursThisMonth(timesheets),
            } satisfies EmployeeRow;
          }),
        );

        if (!cancelled) {
          setProjectOptions(projects);
          setRows(rowsData);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Unable to load employee data";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const uniqueClients = useMemo(() => {
    return [
      "ALL",
      ...Array.from(
        new Set(rows.map((r) => r.clientName).filter((c) => c && c !== "--")),
      ),
    ];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (r.employee.employeeStatus ?? "").toUpperCase() === statusFilter;
      const matchesProject =
        projectFilter === "ALL" || r.clientName === projectFilter;
      const fullName =
        `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase();
      const email = (r.employee.email ?? "").toLowerCase();
      const nameQuery = nameFilter.trim().toLowerCase();
      const matchesName =
        !nameQuery || fullName.includes(nameQuery) || email.includes(nameQuery);
      return matchesStatus && matchesProject && matchesName;
    });
  }, [rows, statusFilter, projectFilter, nameFilter]);

  const activeOnProjects = filteredRows.filter(
    (r) => r.projectName !== "--",
  ).length;
  const pendingTimesheets = filteredRows.filter((r) =>
    r.weekStatusLabel.toLowerCase().includes("pending"),
  ).length;
  const openRoleCount = filteredRows.filter((r) =>
    r.statusLabel.toLowerCase().includes("available"),
  ).length;

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
    } catch {
      // authApi.logout clears local session in finally block
    } finally {
      setIsLoggingOut(false);
      navigate("/login");
    }
  }

  async function handleInviteEmployee(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");

    if (
      !inviteEmail ||
      !inviteAssignedProjectId ||
      !inviteBillingStartDate ||
      !inviteRole ||
      !inviteRoleEndDate ||
      !inviteWorkMode
    ) {
      setInviteError(
        "Employee email, assigned project, start date, role, end date, and work mode are required.",
      );
      return;
    }

    try {
      setInviteSubmitting(true);
      await adminApi.inviteEmployee({
        email: inviteEmail,
        projectId: inviteAssignedProjectId,
        billingStartDate: inviteBillingStartDate,
        role: inviteRole,
        roleEndDate: inviteRoleEndDate,
        workMode: inviteWorkMode,
      });
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteAssignedProjectId("");
      setInviteBillingStartDate("");
      setInviteRole("");
      setInviteRoleEndDate("");
      setInviteWorkMode("ONSITE");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to send invitation";
      setInviteError(message);
    } finally {
      setInviteSubmitting(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setProjectError("");

    if (!clientId || !clientName || !projectName) {
      setProjectError("Client ID, client name, and project name are required.");
      return;
    }

    try {
      setProjectSubmitting(true);
      const today = new Date().toISOString().slice(0, 10);
      const created = await projectsApi.create({
        clientId,
        clientName,
        projectName,
        startDate: today,
        vendor: projectVendor || undefined,
      });

      setProjectOptions((prev) => [created, ...prev]);
      setShowProjectModal(false);
      setClientId("");
      setClientName("");
      setProjectName("");
      setProjectVendor("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create project";
      setProjectError(message);
    } finally {
      setProjectSubmitting(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <Link to="/" className="admin-brand">
          AdvanceIt Technologies
        </Link>

        <nav className="admin-nav-tabs">
          <Link to="/">Home</Link>
          <Link to="/admin/employees" className="active">
            Employees
          </Link>
          <Link to="/admin/projects">Projects</Link>
          <a href="#">Timesheets</a>
          <a href="#">Jobs</a>
          <a href="#">Applicants</a>
        </nav>

        <button
          type="button"
          className="button button-outline"
          onClick={() => {
            void handleLogout();
          }}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </header>

      <main className="admin-main">
        <section className="admin-title-row">
          <div>
            <h1>Employees</h1>
            <p>
              {filteredRows.length} total · {activeOnProjects} active on
              projects
            </p>
          </div>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setInviteError("");
              setShowInviteModal(true);
            }}
          >
            Add employee
          </button>
        </section>

        <section className="admin-summary-grid" aria-label="Admin summary">
          <article className="admin-summary-card">
            <p className="admin-summary-label">Total employees</p>
            <p className="admin-summary-value">{filteredRows.length}</p>
            <p className="admin-summary-sub">Across all filtered records</p>
          </article>
          <article className="admin-summary-card">
            <p className="admin-summary-label">Active projects</p>
            <p className="admin-summary-value">{activeOnProjects}</p>
            <p className="admin-summary-sub">
              Employees assigned to client work
            </p>
          </article>
          <article className="admin-summary-card">
            <p className="admin-summary-label">Timesheets pending</p>
            <p className="admin-summary-value">{pendingTimesheets}</p>
            <p className="admin-summary-sub">Awaiting review this week</p>
          </article>
          <article className="admin-summary-card">
            <p className="admin-summary-label">Available employees</p>
            <p className="admin-summary-value">{openRoleCount}</p>
            <p className="admin-summary-sub">Ready for new assignments</p>
          </article>
        </section>

        <section className="admin-quick-actions" aria-label="Quick actions">
          <h2>Quick actions</h2>
          <div className="admin-quick-grid">
            <button
              type="button"
              className="admin-quick-card admin-quick-link"
              onClick={() => {
                setInviteError("");
                setShowInviteModal(true);
              }}
            >
              <div className="admin-quick-icon">+</div>
              <h3>Invite employee</h3>
              <p>Send a portal invitation to onboard a new employee.</p>
            </button>
            <button
              type="button"
              className="admin-quick-card admin-quick-link"
              onClick={() => {
                setProjectError("");
                setShowProjectModal(true);
              }}
            >
              <div className="admin-quick-icon">+</div>
              <h3>Create project</h3>
              <p>Enter client and vendor information.</p>
            </button>
            <article className="admin-quick-card" aria-disabled="true">
              <div className="admin-quick-icon">T</div>
              <h3>Review timesheets</h3>
              <p>Open pending weekly submissions and approve quickly.</p>
            </article>
            <article className="admin-quick-card" aria-disabled="true">
              <div className="admin-quick-icon">J</div>
              <h3>Post a job</h3>
              <p>Publish a new role and start collecting applicants.</p>
            </article>
          </div>
        </section>

        <section className="admin-filters">
          <input
            type="search"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Filter by name"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="PLACED">Placed</option>
            <option value="NOT_AVAILABLE">Not available</option>
            <option value="TRAINING">Training</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by client"
          >
            {uniqueClients.map((client) => (
              <option key={client} value={client}>
                {client === "ALL" ? "All clients" : client}
              </option>
            ))}
          </select>
        </section>

        {isLoading ? (
          <p className="admin-note">Loading employee data...</p>
        ) : null}
        {error ? <p className="admin-error">{error}</p> : null}

        <section
          className="admin-table-wrap"
          aria-label="Employee lifecycle table"
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Status</th>
                <th>Project</th>
                <th>Hours this month</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    No employees found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const progress = Math.min(
                    (row.hoursThisMonth / 160) * 100,
                    100,
                  );
                  return (
                    <tr key={row.employee.id}>
                      <td>
                        <div className="admin-employee-cell">
                          <span className="admin-avatar">
                            {getInitials(
                              row.employee.firstName,
                              row.employee.lastName,
                            )}
                          </span>
                          <div>
                            <p className="admin-name">
                              {row.employee.firstName} {row.employee.lastName}
                            </p>
                            <p className="admin-email">{row.employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{row.employee.role || "--"}</td>
                      <td>
                        <span className={statusClass(row.statusLabel)}>
                          {row.statusLabel}
                        </span>
                      </td>
                      <td>
                        <p className="admin-project-name">{row.projectName}</p>
                        <p className="admin-project-client">{row.clientName}</p>
                      </td>
                      <td>
                        <div className="admin-hours-cell">
                          <div className="admin-hours-bar">
                            <span style={{ width: `${progress}%` }} />
                          </div>
                          <span>
                            {row.hoursThisMonth > 0
                              ? `${Math.round(row.hoursThisMonth)}h`
                              : row.weekStatusLabel}
                          </span>
                        </div>
                      </td>
                      <td>{formatShortDate(row.employee.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </main>

      {showInviteModal ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInviteModal(false);
            }
          }}
        >
          <section className="admin-modal">
            <header className="admin-modal-header">
              <div>
                <h3>Invite employee</h3>
                <p>Store employee invite and assignment details.</p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowInviteModal(false)}
                aria-label="Close employee invite popup"
              >
                x
              </button>
            </header>

            <form className="admin-form-grid" onSubmit={handleInviteEmployee}>
              <div className="admin-field">
                <label htmlFor="invite-email">Employee email</label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  placeholder="employee@email.com"
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="invite-project">Assigned project</label>
                <select
                  id="invite-project"
                  value={inviteAssignedProjectId}
                  onChange={(e) => setInviteAssignedProjectId(e.target.value)}
                  required
                >
                  <option value="">Select project</option>
                  {projectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName} · {project.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="invite-billing-start">Billing start date</label>
                <input
                  id="invite-billing-start"
                  type="date"
                  value={inviteBillingStartDate}
                  onChange={(e) => setInviteBillingStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="invite-role">Role</label>
                <input
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="e.g. Senior Java Developer"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="invite-role-end-date">Role end date</label>
                <input
                  id="invite-role-end-date"
                  type="date"
                  value={inviteRoleEndDate}
                  onChange={(e) => setInviteRoleEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="invite-work-mode">Work mode</label>
                <select
                  id="invite-work-mode"
                  value={inviteWorkMode}
                  onChange={(e) => setInviteWorkMode(e.target.value)}
                  required
                >
                  <option value="ONSITE">Onsite</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>

              {inviteError ? (
                <p className="admin-error">{inviteError}</p>
              ) : null}

              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={inviteSubmitting}
                >
                  {inviteSubmitting ? "Inviting..." : "Invite employee"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {showProjectModal ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProjectModal(false);
            }
          }}
        >
          <section className="admin-modal">
            <header className="admin-modal-header">
              <div>
                <h3>Create project</h3>
                <p>Enter client and vendor information.</p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowProjectModal(false)}
                aria-label="Close project popup"
              >
                x
              </button>
            </header>

            <form className="admin-form-grid" onSubmit={handleCreateProject}>
              <div className="admin-field">
                <label htmlFor="project-client-id">Client ID</label>
                <input
                  id="project-client-id"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. CL-001"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="project-client-name">Client name</label>
                <input
                  id="project-client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Beta Inc"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="project-name">Project name</label>
                <input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Data Modernization"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="project-vendor">
                  Vendor / implementation partner (if any)
                </label>
                <input
                  id="project-vendor"
                  value={projectVendor}
                  onChange={(e) => setProjectVendor(e.target.value)}
                  placeholder="e.g. Cognizant / Tech Mahindra"
                />
              </div>

              {projectError ? (
                <p className="admin-error">{projectError}</p>
              ) : null}

              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={projectSubmitting}
                >
                  {projectSubmitting ? "Creating..." : "Create project"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default AdminEmployeesPage;
