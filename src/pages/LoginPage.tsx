import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ApiError, authApi, employeesApi } from "../api/api";
import "../styles/auth.css";

type Mode = "login" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const auth = await authApi.login({ email, password });

      if (auth.user?.role?.toUpperCase().includes("ADMIN")) {
        navigate("/admin/employees");
        return;
      }

      // If profile exists, go to dashboard. Otherwise complete profile first.
      try {
        await employeesApi.getMyProfile();
        navigate("/dashboard");
      } catch (profileErr) {
        if (profileErr instanceof ApiError && profileErr.status === 404) {
          navigate("/profile-setup");
        } else {
          const message =
            profileErr instanceof Error
              ? profileErr.message
              : "Session is not authorized. Please login again.";
          setError(message);
        }
      }
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 403
          ? "Access denied. If you are newly invited, use Register first from the home page."
          : err instanceof Error
            ? err.message
            : "Login failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !newPassword) {
      setError("Please enter your email and new password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.forgotPassword({ email, newPassword });
      setForgotSent(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Password reset failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
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
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>

              <p className="auth-switch-text">
                New employee? <Link to="/register">Register</Link>
              </p>
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

                <div className="field">
                  <label htmlFor="forgot-new-password">New password</label>
                  <input
                    id="forgot-new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="auth-submit">
                  {isSubmitting ? "Submitting..." : "Reset password"}
                </button>
              </form>
            )}

            <button
              type="button"
              className="link-btn back-btn"
              onClick={() => {
                setMode("login");
                setForgotSent(false);
                setNewPassword("");
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
