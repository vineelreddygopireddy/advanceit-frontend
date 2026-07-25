// Shared types used across timesheet and dashboard features

export type TimesheetStatus = "SAVED" | "PENDING" | "APPROVED" | "REJECTED";

export interface DayHours {
  st: number; // Standard
  ot: number; // Overtime
  dt: number; // Double-time
  others: number;
}

export interface WeeklyTimesheet {
  id: string;
  weekStartDate: string; // ISO date of Monday
  weekEndDate: string;   // ISO date of Sunday
  status: TimesheetStatus;
  revision: number;
  days: Record<string, DayHours>; // key: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
  // totals
  totalST: number;
  totalOT: number;
  totalDT: number;
  totalOthers: number;
  totalNB: number;
}

export interface AssignedProject {
  id: string;
  name: string;
  client: string;
  supervisor: string;
  department: string;
  location: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  timesheetFrequency: "WEEKLY";
}
