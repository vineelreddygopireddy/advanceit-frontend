function StorySection() {
  return (
    <section className="story-section" id="about">
      <div className="story-copy">
        <p className="eyebrow">Our story</p>
        <h2>Powering business growth through deep technology expertise</h2>
        <p>
          AdvanceIT Technologies is a certified full-service IT consulting firm
          based in New Jersey. We serve top organizations by leveraging
          industry-wide experience, deep technology expertise, and a vertically
          aligned business model to deliver consulting, staffing, software
          solutions, mobile apps, big data and training.
        </p>
        <p style={{ marginTop: "16px" }}>
          Our philosophy is simple — power should be returned to the client. We
          work closely with each organization to design flexible, scalable, and
          easy-to-use solutions that increase efficiency, enhance collaboration,
          and drive faster decision-making.
        </p>
      </div>
      <div className="story-card">
        <div>
          <p className="card-label">Headquarters</p>
          <p className="card-value">Woodbridge, NJ</p>
        </div>
        <div>
          <p className="card-label">Experience</p>
          <p className="card-value">10+ years</p>
        </div>
        <div>
          <p className="card-label">Specialization</p>
          <p className="card-value">IT Staffing &amp; Consulting</p>
        </div>
        <div>
          <p className="card-label">Industries</p>
          <p className="card-value">Tech · Finance · Ops</p>
        </div>
      </div>
    </section>
  );
}

export default StorySection;
