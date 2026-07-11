function StorySection() {
  return (
    <section className="story-section" id="about">
      <div className="story-copy">
        <p className="eyebrow">Our story</p>
        <h2>We started with one idea — hiring should be transparent</h2>
        <p>
          HireXYZ was founded in 2019 by a small team tired of opaque
          recruitment processes. We built a platform where candidates know
          exactly where they stand, and companies get the right fit — not just
          the fastest hire.
        </p>
      </div>
      <div className="story-card">
        <div>
          <p className="card-label">Founded</p>
          <p className="card-value">2019</p>
        </div>
        <div>
          <p className="card-label">Location</p>
          <p className="card-value">Dallas, TX</p>
        </div>
        <div>
          <p className="card-label">Team members</p>
          <p className="card-value">50–100</p>
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
