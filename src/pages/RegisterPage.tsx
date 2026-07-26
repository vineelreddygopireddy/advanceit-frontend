import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, authApi, employeesApi } from "../api/api";
import "../styles/auth.css";

type VisaStatus =
  | "US_CITIZEN"
  | "GREEN_CARD"
  | "H1B"
  | "H4_EAD"
  | "OPT"
  | "CPT"
  | "TN"
  | "OTHER";

type EmployeeStatus = "AVAILABLE" | "PLACED" | "NOT_AVAILABLE" | "TRAINING";

interface EmployeeDetailsForm {
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  skills: string;
  yearsOfExperience: string;
  visaStatus: VisaStatus;
  department: string;
  location: string;
  phoneNumber: string;
  employeeStatus: EmployeeStatus;
}

const VISA_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: "US_CITIZEN", label: "US Citizen" },
  { value: "GREEN_CARD", label: "Green Card" },
  { value: "H1B", label: "H-1B" },
  { value: "H4_EAD", label: "H-4 EAD" },
  { value: "OPT", label: "OPT" },
  { value: "CPT", label: "CPT" },
  { value: "TN", label: "TN Visa" },
  { value: "OTHER", label: "Other" },
];

const EMPLOYEE_STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "PLACED", label: "Placed" },
  { value: "NOT_AVAILABLE", label: "Not Available" },
  { value: "TRAINING", label: "In Training" },
];

const INITIAL_DETAILS: EmployeeDetailsForm = {
  firstName: "",
  lastName: "",
  password: "",
  role: "",
  skills: "",
  yearsOfExperience: "",
  visaStatus: "OTHER",
  department: "",
  location: "",
  phoneNumber: "",
  employeeStatus: "AVAILABLE",
};

function looksLikeEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function RegisterPage() {
  const navigate = useNavigate();
  const [invitedEmail, setInvitedEmail] = useState("");
  const [isInviteStepValid, setIsInviteStepValid] = useState(false);
  const [details, setDetails] = useState<EmployeeDetailsForm>(INITIAL_DETAILS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof EmployeeDetailsForm, value: string) {
    setDetails((prev) => ({ ...prev, [field]: value }));
  }

  function handleValidateInviteStep(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!looksLikeEmail(invitedEmail)) {
      setError("Enter a valid invited employee email.");
      return;
    }

    setIsInviteStepValid(true);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!details.firstName || !details.lastName || !details.password || !details.role) {
      setError("First name, last name, password, and role are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      await authApi.register({
        email: invitedEmail,
        password: details.password,
        firstName: details.firstName,
        lastName: details.lastName,
      });

      await employeesApi.create({
        firstName: details.firstName,
        lastName: details.lastName,
        role: details.role,
        skills: details.skills || undefined,
        yearsOfExperience: details.yearsOfExperience
          ? parseInt(details.yearsOfExperience, 10)
          : undefined,
        visaStatus: details.visaStatus,
        department: details.department || undefined,
        location: details.location || undefined,
        phoneNumber: details.phoneNumber || undefined,
        employeeStatus: details.employeeStatus,
      });

      navigate("/dashboard");
    } catch (err) {
      const apiMessage = err instanceof Error ? err.message : "";
      const message =
        err instanceof ApiError &&
        err.status === 400 &&
        /not approved|not invited/i.test(apiMessage)
          ? "Email is not registered. Use the email that admin used to invite you or check with admin."
          : err instanceof ApiError && err.status === 400
            ? apiMessage
            : err instanceof Error
              ? err.message
              : "Unable to register employee";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card profile-card">
        <Link to="/" className="auth-brand">
          AdvanceIt Technologies
        </Link>

        <h1 className="auth-title">Register employee account</h1>
        <p className="auth-sub">Enter your email to continue.</p>

        {!isInviteStepValid ? (
          <form className="auth-form" onSubmit={handleValidateInviteStep}>
            <div className="field">
              <label htmlFor="invited-email">Invited employee email</label>
              <input
                id="invited-email"
                type="email"
                value={invitedEmail}
                onChange={(e) => setInvitedEmail(e.target.value)}
                placeholder="employee@company.com"
                required
              />
            </div>

            <p className="field-hint">
              Please make sure to enter the email that admin used to send the invite.
            </p>

            {error ? <p className="auth-error">{error}</p> : null}

            <button type="submit" className="auth-submit">
              Continue
            </button>
          </form>
        ) : (
          <form className="auth-form profile-form" onSubmit={handleRegister}>
            <div className="auth-notice">
              Invited employee email: <strong>{invitedEmail}</strong>
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  value={details.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  value={details.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={details.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Create password"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="role">Job title / Role</label>
              <input
                id="role"
                value={details.role}
                onChange={(e) => update("role", e.target.value)}
                placeholder="e.g. Senior Java Developer"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="skills">Skills</label>
              <textarea
                id="skills"
                value={details.skills}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="e.g. Java, Spring Boot, React"
                rows={3}
              />
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="yearsOfExperience">Years of experience</label>
                <input
                  id="yearsOfExperience"
                  type="number"
                  min={0}
                  max={50}
                  value={details.yearsOfExperience}
                  onChange={(e) => update("yearsOfExperience", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="visaStatus">Visa status</label>
                <select
                  id="visaStatus"
                  value={details.visaStatus}
                  onChange={(e) => update("visaStatus", e.target.value as VisaStatus)}
                >
                  {VISA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  value={details.department}
                  onChange={(e) => update("department", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  value={details.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="phoneNumber">Phone number</label>
                <input
                  id="phoneNumber"
                  value={details.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="employeeStatus">Employee status</label>
                <select
                  id="employeeStatus"
                  value={details.employeeStatus}
                  onChange={(e) =>
                    update("employeeStatus", e.target.value as EmployeeStatus)
                  }
                >
                  {EMPLOYEE_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? <p className="auth-error">{error}</p> : null}

            <div className="auth-inline-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  setIsInviteStepValid(false);
                  setError("");
                }}
              >
                Edit emails
              </button>
              <button type="submit" className="auth-submit auth-submit-inline">
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
        )}

        <p className="auth-switch-text">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
