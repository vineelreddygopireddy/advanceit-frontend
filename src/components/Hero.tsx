function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <p className="eyebrow">14 open positions</p>
        <h1>Find a role that fits your next chapter</h1>
        <p className="hero-copy">
          Browse open positions, upload your resume, and track your application
          — all in one place.
        </p>
        <form
          className="search-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="Search roles, skills, or departments…"
            aria-label="Search jobs"
          />
          <button type="submit">Search jobs</button>
        </form>
      </div>
    </section>
  );
}

export default Hero;
