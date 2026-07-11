function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">HireXYZ</div>
      <nav className="nav-links">
        <a href="#jobs">Jobs</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="nav-actions">
        <button type="button" className="button button-outline">
          Log in
        </button>
        <button type="button" className="button button-primary">
          Sign up
        </button>
      </div>
    </header>
  );
}

export default Navbar;
