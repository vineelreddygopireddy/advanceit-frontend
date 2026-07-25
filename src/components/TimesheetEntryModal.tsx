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
import { MOCK_PROJECT } from "../utils/timesheetUtils";

interface Props {
  weekStart: Date;
  onClose: () => void;
  onSave: (sheet: WeeklyTimesheet) => void;
}

type HoursCol = (typeof HOURS_COLS)[number];

function TimesheetEntryModal({ weekStart, onClose, onSave }: Props) {
  const weekEnd = getWeekEnd(weekStart);
  const [days, setDays] = useState(emptyDays);
  const totals = calcTotals(days);

  function setHour(day: string, col: HoursCol, raw: string) {
    const val = parseFloat(raw) || 0;
    setDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], [col]: val },
    }));
  }

  function handleSave(status: "SAVED" | "PENDING") {
    const id = `CTZTS${String(Date.now()).slice(-6)}`;
    const sheet: WeeklyTimesheet = {
      id,
      weekStartDate: toISODate(weekStart),
      weekEndDate: toISODate(weekEnd),
      status,
      revision: 0,
      days,
      totalST: totals.st,
      totalOT: totals.ot,
      totalDT: totals.dt,
      totalOthers: totals.others,
      totalNB: 0,
    };
    onSave(sheet);
    onClose();
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
            <strong>{MOCK_PROJECT.name}</strong> · {MOCK_PROJECT.client}
          </span>
          <span>
            Supervisor: <strong>{MOCK_PROJECT.supervisor}</strong>
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
          <button
            type="button"
            className="button button-outline"
            onClick={() => handleSave("SAVED")}
          >
            Save draft
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => handleSave("PENDING")}
          >
            Submit for approval
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimesheetEntryModal;
