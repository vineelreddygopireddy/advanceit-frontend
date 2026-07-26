import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        AdvanceIt Technologies
      </Link>

      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`nav-links${open ? " open" : ""}`}>
        <a href="#jobs" onClick={() => setOpen(false)}>
          Jobs
        </a>
        <a href="#about" onClick={() => setOpen(false)}>
          About
        </a>
        <a href="#contact" onClick={() => setOpen(false)}>
          Contact
        </a>
        <div className="nav-actions">
          <Link to="/register" className="button button-primary">
            Register
          </Link>
          <Link to="/login" className="button button-outline">
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
