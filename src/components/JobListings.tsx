const jobs = [
  {
    title: "Senior React Developer",
    location: "Remote",
    department: "Engineering",
    type: "Full-time",
    badge: "New",
  },
  {
    title: "Java Backend Engineer",
    location: "Hybrid",
    department: "Engineering",
    type: "Contract",
  },
  {
    title: "HR Business Partner",
    location: "On-site",
    department: "People ops",
    type: "Full-time",
  },
  {
    title: "Product Designer",
    location: "Remote",
    department: "Design",
    type: "Full-time",
  },
];

function JobListings() {
  return (
    <section className="jobs-section" id="jobs">
      <div className="jobs-header">
        <div>
          <p className="eyebrow">Updated daily — apply directly from here.</p>
          <h2>Open roles</h2>
        </div>
        <div className="job-filters">
          <select aria-label="Filter by department">
            <option>All departments</option>
            <option>Engineering</option>
            <option>People ops</option>
            <option>Design</option>
          </select>
          <select aria-label="Filter by role type">
            <option>All types</option>
            <option>Full-time</option>
            <option>Contract</option>
            <option>Part-time</option>
          </select>
        </div>
      </div>
      <div className="jobs-grid">
        {jobs.map((job) => (
          <article key={job.title} className="job-card">
            <div className="job-card-heading">
              <div>
                <h3>{job.title}</h3>
                <p>
                  {job.location} · {job.department}
                </p>
              </div>
              <span className="job-type">{job.type}</span>
            </div>
            <div className="job-card-footer">
              {job.badge && <span className="job-badge">{job.badge}</span>}
              <button type="button" className="button button-outline">
                Apply
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default JobListings;
