import { useState } from "react";
import type { WeeklyTimesheet } from "../types/timesheet";
import {
  DAYS,
  HOURS_COLS,
  emptyDays,
  calcTotals,
  formatDate,
  toISODate,
  getWeekEnd,
} from "../utils/timesheetUtils";

interface WeeklyEntryPayload {
  status: "SAVED" | "PENDING";
  weekStartDate: string;
  weekEndDate: string;
  days: WeeklyTimesheet["days"];
  totalST: number;
  totalOT: number;
  totalDT: number;
  totalOthers: number;
  totalNB: number;
}

interface Props {
  weekStart: Date;
  onClose: () => void;
  onSave: (payload: WeeklyEntryPayload) => Promise<void>;
  projectName: string;
  clientName: string;
  supervisor: string;
}

type HoursCol = (typeof HOURS_COLS)[number];

function TimesheetEntryModal({
  weekStart,
  onClose,
  onSave,
  projectName,
  clientName,
  supervisor,
}: Props) {
  const weekEnd = getWeekEnd(weekStart);
  const [days, setDays] = useState(emptyDays);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const totals = calcTotals(days);

  function setHour(day: string, col: HoursCol, raw: string) {
    const val = parseFloat(raw) || 0;
    setDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], [col]: val },
    }));
  }

  async function handleSave(status: "SAVED" | "PENDING") {
    setSaveError("");
    try {
      setIsSaving(true);
      await onSave({
        status,
        weekStartDate: toISODate(weekStart),
        weekEndDate: toISODate(weekEnd),
        days,
        totalST: totals.st,
        totalOT: totals.ot,
        totalDT: totals.dt,
        totalOthers: totals.others,
        totalNB: 0,
      });
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save timesheet";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3>Enter Timesheet</h3>
            <p>
              Week: {formatDate(toISODate(weekStart))} –{" "}
              {formatDate(toISODate(weekEnd))}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-project-banner">
          <span>
            <strong>{projectName}</strong> · {clientName}
          </span>
          <span>
            Supervisor: <strong>{supervisor}</strong>
          </span>
        </div>

        {/* Column headers */}
        <div className="week-grid">
          <div className="week-grid-head">
            <span>Day</span>
            <span>ST (hrs)</span>
            <span>OT (hrs)</span>
            <span>DT (hrs)</span>
            <span>Others</span>
          </div>

          {DAYS.map((day) => (
            <div className="week-grid-row" key={day}>
              <span className="day-label">{day}</span>
              {HOURS_COLS.map((col) => (
                <input
                  key={col}
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={days[day][col] === 0 ? "" : days[day][col]}
                  placeholder="0"
                  onChange={(e) => setHour(day, col, e.target.value)}
                  aria-label={`${day} ${col.toUpperCase()}`}
                />
              ))}
            </div>
          ))}

          <div className="week-totals">
            <span>Total</span>
            {HOURS_COLS.map((col) => (
              <span key={col}>{totals[col].toFixed(2)}</span>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          {saveError ? (
            <p style={{ color: "#c53030", margin: 0, width: "100%" }}>
              {saveError}
            </p>
          ) : null}
          <button
            type="button"
            className="button button-outline"
            onClick={() => handleSave("SAVED")}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => handleSave("PENDING")}
            disabled={isSaving}
          >
            {isSaving ? "Submitting..." : "Submit for approval"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimesheetEntryModal;
