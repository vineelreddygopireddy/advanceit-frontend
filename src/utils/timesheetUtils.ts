import type { WeeklyTimesheet, AssignedProject } from "../types/timesheet";

// Returns the Monday of the week containing a given date
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6); // Sunday
  return d;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const HOURS_COLS = ["st", "ot", "dt", "others"] as const;

export function emptyDays() {
  return Object.fromEntries(
    DAYS.map((d) => [d, { st: 0, ot: 0, dt: 0, others: 0 }])
  ) as Record<string, { st: number; ot: number; dt: number; others: number }>;
}

export function calcTotals(days: ReturnType<typeof emptyDays>) {
  return HOURS_COLS.reduce(
    (acc, col) => {
      acc[col] = DAYS.reduce((s, d) => s + (days[d]?.[col] ?? 0), 0);
      return acc;
    },
    {} as Record<string, number>
  );
}

// ── Mock seed data (replace with API calls) ──────────────────────────────────

export const MOCK_PROJECT: AssignedProject = {
  id: "CTZTQ0001",
  name: "Cognizant Digital Transformation",
  client: "Cognizant Technology Solutions",
  supervisor: "GILMORE, JAMES",
  department: "Engineering",
  location: "Remote / NJ",
  startDate: "2026-05-10",
  endDate: null,
  status: "ACTIVE",
  timesheetFrequency: "WEEKLY",
};

function makeSheet(
  id: string,
  startISO: string,
  status: WeeklyTimesheet["status"],
  st = 40
): WeeklyTimesheet {
  const start = new Date(startISO);
  const end = getWeekEnd(start);
  const days = emptyDays();
  // Distribute ST across Mon–Fri evenly
  const perDay = st / 5;
  (["Mon", "Tue", "Wed", "Thu", "Fri"] as const).forEach((d) => {
    days[d].st = perDay;
  });
  return {
    id,
    weekStartDate: toISODate(start),
    weekEndDate: toISODate(end),
    status,
    revision: 0,
    days,
    totalST: st,
    totalOT: 0,
    totalDT: 0,
    totalOthers: 0,
    totalNB: 0,
  };
}

export const MOCK_TIMESHEETS: WeeklyTimesheet[] = [
  makeSheet("CTZTS003764", "2026-07-05", "PENDING", 40),
  makeSheet("CTZTS003750", "2026-06-28", "APPROVED", 40),
  makeSheet("CTZTS003733", "2026-06-21", "APPROVED", 40),
  makeSheet("CTZTS003719", "2026-06-14", "APPROVED", 32),
  makeSheet("CTZTS003705", "2026-06-07", "APPROVED", 40),
  makeSheet("CTZTS003692", "2026-05-31", "APPROVED", 40),
  makeSheet("CTZTS003678", "2026-05-24", "APPROVED", 32),
  makeSheet("CTZTS003666", "2026-05-17", "APPROVED", 40),
  makeSheet("CTZTS003643", "2026-05-10", "APPROVED", 40),
];
