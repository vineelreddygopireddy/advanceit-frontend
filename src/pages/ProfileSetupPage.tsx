import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

type CandidateStatus = "AVAILABLE" | "PLACED" | "NOT_AVAILABLE" | "TRAINING";

interface ProfileForm {
  firstName: string;
  lastName: string;
  role: string;
  skills: string;
  yearsOfExperience: string;
  visaStatus: VisaStatus;
  department: string;
  location: string;
  phoneNumber: string;
  candidateStatus: CandidateStatus;
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

const CANDIDATE_STATUS_OPTIONS: { value: CandidateStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "PLACED", label: "Placed" },
  { value: "NOT_AVAILABLE", label: "Not Available" },
  { value: "TRAINING", label: "In Training" },
];

const INITIAL: ProfileForm = {
  firstName: "",
  lastName: "",
  role: "",
  skills: "",
  yearsOfExperience: "",
  visaStatus: "OTHER",
  department: "",
  location: "",
  phoneNumber: "",
  candidateStatus: "AVAILABLE",
};

function ProfileSetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>(INITIAL);
  const [error, setError] = useState("");

  function update(field: keyof ProfileForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.role) {
      setError("First name, last name, and role are required.");
      return;
    }
    // TODO: POST to backend API
    console.log("Profile payload:", {
      ...form,
      yearsOfExperience: form.yearsOfExperience
        ? parseInt(form.yearsOfExperience, 10)
        : null,
    });
    navigate("/dashboard");
  }

  return (
    <div className="auth-page">
      <div className="auth-card profile-card">
        <p className="auth-brand">AdvanceIt Technologies</p>
        <h1 className="auth-title">Complete your profile</h1>
        <p className="auth-sub">Tell us a bit about yourself to get started.</p>

        <form className="auth-form profile-form" onSubmit={handleSubmit}>
          {/* Name row */}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="firstName">
                First name <span className="req">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="Jane"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">
                Last name <span className="req">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="field">
            <label htmlFor="role">
              Job title / Role <span className="req">*</span>
            </label>
            <input
              id="role"
              type="text"
              placeholder="e.g. Senior Java Developer"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              required
            />
          </div>

          {/* Skills */}
          <div className="field">
            <label htmlFor="skills">Skills</label>
            <textarea
              id="skills"
              placeholder="e.g. Java, Spring Boot, React, SQL"
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
              rows={3}
            />
            <p className="field-hint">
              Comma-separated list of technologies or skills.
            </p>
          </div>

          {/* Experience + Visa */}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="yearsOfExperience">Years of experience</label>
              <input
                id="yearsOfExperience"
                type="number"
                min={0}
                max={50}
                placeholder="e.g. 5"
                value={form.yearsOfExperience}
                onChange={(e) => update("yearsOfExperience", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="visaStatus">Visa status</label>
              <select
                id="visaStatus"
                value={form.visaStatus}
                onChange={(e) =>
                  update("visaStatus", e.target.value as VisaStatus)
                }
              >
                {VISA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department + Location */}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Woodbridge, NJ"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>
          </div>

          {/* Phone + Status */}
          <div className="field-grid">
            <div className="field">
              <label htmlFor="phoneNumber">Phone number</label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (732) 000-0000"
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="candidateStatus">Candidate status</label>
              <select
                id="candidateStatus"
                value={form.candidateStatus}
                onChange={(e) =>
                  update("candidateStatus", e.target.value as CandidateStatus)
                }
              >
                {CANDIDATE_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            Save &amp; continue →
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetupPage;
