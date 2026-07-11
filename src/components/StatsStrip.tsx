const stats = [
  { label: "Candidates placed", value: "148+" },
  { label: "Open roles", value: "14" },
  { label: "Departments", value: "6" },
  { label: "Avg. candidate rating", value: "4.8★" },
];

function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="Quick stats">
      {stats.map((item) => (
        <div key={item.label} className="stat-card">
          <p className="stat-value">{item.value}</p>
          <p className="stat-label">{item.label}</p>
        </div>
      ))}
    </section>
  );
}

export default StatsStrip;
