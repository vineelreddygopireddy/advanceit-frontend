import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, projectsApi } from "../api/api";
import type { ProjectResponse } from "../api/api";
import "../styles/admin.css";

function formatDateLabel(dateISO?: string | null) {
  if (!dateISO) {
    return "--";
  }

  const parsed = new Date(dateISO);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function AdminProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setError("");
        setIsLoading(true);
        const rows = await projectsApi.getAll();

        if (!cancelled) {
          setProjects(rows);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Unable to load projects";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return projects;
    }

    return projects.filter((project) => {
      const fullText = [
        project.projectName,
        project.clientName,
        project.clientId,
        project.vendor ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return fullText.includes(q);
    });
  }, [projects, query]);

  const totalAssignments = filteredProjects.reduce(
    (sum, project) => sum + (project.assignments?.length ?? 0),
    0,
  );
  const activeProjects = filteredProjects.filter(
    (project) => !project.endDate,
  ).length;
  const uniqueClients = new Set(filteredProjects.map((p) => p.clientId)).size;

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
    } catch {
      // Session cleanup is done in authApi.logout finally block.
    } finally {
      setIsLoggingOut(false);
      navigate("/login");
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
          <Link to="/admin/employees">Employees</Link>
          <Link to="/admin/projects" className="active">
            Projects
          </Link>
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
            <h1>Projects</h1>
            <p>{filteredProjects.length} total projects</p>
          </div>
          <Link to="/admin/employees" className="button button-primary">
            + Create project
          </Link>
        </section>

        <section className="admin-summary-grid" aria-label="Project summary">
          <article className="admin-summary-card">
            <p className="admin-summary-label">Total projects</p>
            <p className="admin-summary-value">{filteredProjects.length}</p>
            <p className="admin-summary-sub">Across all clients</p>
          </article>
          <article className="admin-summary-card">
            <p className="admin-summary-label">Active projects</p>
            <p className="admin-summary-value">{activeProjects}</p>
            <p className="admin-summary-sub">No end date assigned</p>
          </article>
          <article className="admin-summary-card">
            <p className="admin-summary-label">Client accounts</p>
            <p className="admin-summary-value">{uniqueClients}</p>
            <p className="admin-summary-sub">Distinct client IDs</p>
          </article>
          <article className="admin-summary-card">
            <p className="admin-summary-label">Assigned employees</p>
            <p className="admin-summary-value">{totalAssignments}</p>
            <p className="admin-summary-sub">Total active assignments</p>
          </article>
        </section>

        <section className="admin-filters">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project, client, vendor"
            aria-label="Search projects"
          />
          <div className="admin-filter-chip">Project management</div>
          <div className="admin-filter-chip">Backend-aligned view</div>
        </section>

        {isLoading ? (
          <p className="admin-note">Loading project data...</p>
        ) : null}
        {error ? <p className="admin-error">{error}</p> : null}

        <section className="admin-table-wrap" aria-label="Projects table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Start</th>
                <th>End</th>
                <th>Vendor / partner</th>
                <th>Employees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <p className="admin-project-name">
                        {project.projectName}
                      </p>
                      <p className="admin-project-client">{project.id}</p>
                    </td>
                    <td>
                      <p className="admin-project-name">{project.clientName}</p>
                      <p className="admin-project-client">{project.clientId}</p>
                    </td>
                    <td>{formatDateLabel(project.startDate)}</td>
                    <td>{formatDateLabel(project.endDate)}</td>
                    <td>{project.vendor || "--"}</td>
                    <td>{project.assignments?.length ?? 0}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="button button-outline admin-btn-sm"
                          disabled
                          title="Project edit endpoint is not available in backend yet"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button admin-btn-danger admin-btn-sm"
                          disabled
                          title="Project delete endpoint is not available in backend yet"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default AdminProjectsPage;
