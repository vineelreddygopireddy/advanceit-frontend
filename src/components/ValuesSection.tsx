const values = [
  {
    title: "Transparency",
    description: "Candidates always know where they stand in the process.",
  },
  {
    title: "Speed",
    description: "We move fast — from posting to placement in days, not weeks.",
  },
  {
    title: "People first",
    description:
      "Every decision is made with candidates and hiring managers in mind.",
  },
  {
    title: "Compliance",
    description:
      "Timesheets, records, and data are kept secure and audit-ready.",
  },
];

function ValuesSection() {
  return (
    <section className="values-section">
      <div className="section-header">
        <p className="eyebrow">Our values</p>
      </div>
      <div className="values-grid">
        {values.map((item) => (
          <article key={item.title} className="value-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ValuesSection;
