const stats = [
  { label: "Employees placed", value: "500+" },
  { label: "Open roles", value: "20+" },
  { label: "Years of experience", value: "10+" },
  { label: "Client satisfaction", value: "4.9★" },
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
