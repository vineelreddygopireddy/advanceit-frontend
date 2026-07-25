const values = [
  {
    title: "Client-first",
    description:
      "We return power to the client — every solution is designed around your specific needs.",
  },
  {
    title: "Deep expertise",
    description:
      "Years of experience across IT strategy, security, staffing, and enterprise software.",
  },
  {
    title: "Speed to value",
    description:
      "From posting to placement in days, not weeks — without compromising on fit.",
  },
  {
    title: "Compliance & trust",
    description:
      "Timesheets, records, and data are kept secure, transparent, and audit-ready.",
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
