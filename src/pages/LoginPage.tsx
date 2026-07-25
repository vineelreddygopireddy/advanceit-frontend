import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

type Mode = "login" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    // TODO: replace with real auth call — navigate to profile-setup on first login, else /dashboard
    navigate("/profile-setup");
  }

  function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    // TODO: replace with real API call
    setForgotSent(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          AdvanceIt Technologies
        </Link>

        {mode === "login" ? (
          <>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to your account</p>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@advanceitusa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field">
                <div className="field-row">
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit">
                Sign in
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-sub">
              Enter your email and we'll send you a reset link.
            </p>

            {forgotSent ? (
              <div className="auth-notice">
                ✅ Check your inbox — a reset link has been sent to{" "}
                <strong>{email}</strong>.
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleForgot}>
                <div className="field">
                  <label htmlFor="forgot-email">Email address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@advanceitusa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="auth-submit">
                  Send reset link
                </button>
              </form>
            )}

            <button
              type="button"
              className="link-btn back-btn"
              onClick={() => {
                setMode("login");
                setForgotSent(false);
                setError("");
              }}
            >
              ← Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
