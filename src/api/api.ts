const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type UUID = string;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface UserResponse {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
  newPassword: string;
}

export interface EmployeeRequest {
  firstName: string;
  lastName: string;
  role: string;
  skills?: string;
  yearsOfExperience?: number;
  visaStatus?: string;
  department?: string;
  location?: string;
  phoneNumber?: string;
  employeeStatus?: string;
}

export interface EmployeeResponse {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  skills: string | null;
  yearsOfExperience: number | null;
  visaStatus: string | null;
  department: string | null;
  location: string | null;
  phoneNumber: string | null;
  employeeStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignProjectRequest {
  employeeId: UUID;
  timesheetStartDate: string;
}

export interface ProjectRequest {
  clientId: string;
  clientName: string;
  projectName: string;
  startDate: string;
  endDate?: string;
  billing?: number;
  vendor?: string;
}

export interface ProjectAssignmentResponse {
  projectId: UUID;
  employeeId: UUID;
  employeeName: string;
  timesheetStartDate: string;
}

export interface ProjectResponse {
  id: UUID;
  clientId: string;
  clientName: string;
  projectName: string;
  startDate: string;
  endDate: string | null;
  billing: number | null;
  vendor: string | null;
  assignments: ProjectAssignmentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetRequest {
  employeeId: UUID;
  projectId: UUID;
  entryDate: string;
  details: unknown;
  status: string;
}

export interface TimesheetResponse {
  id: UUID;
  employeeId: UUID;
  employeeName: string;
  projectId: UUID;
  projectName: string;
  clientName: string;
  entryDate: string;
  details: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InviteEmployeeRequest {
  email: string;
  projectId: UUID;
  billingStartDate: string;
  role: string;
  roleEndDate?: string;
  workMode: string;
}

export interface InvitationResponse {
  id: UUID;
  email: string;
  projectId: UUID;
  billingStartDate: string;
  role: string;
  roleEndDate: string | null;
  workMode: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface AddAdminRequest {
  email: string;
}

export interface AdminResponse {
  id: UUID;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const AUTH_TOKEN_KEY = "advanceit.auth.token";
const AUTH_USER_KEY = "advanceit.auth.user";

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  // Normalize both formats: "<jwt>" and "Bearer <jwt>"
  const normalized = token.startsWith("Bearer ") ? token.slice(7) : token;
  localStorage.setItem(AUTH_TOKEN_KEY, normalized);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): UserResponse | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

export function setAuthUser(user: UserResponse) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function clearAuthSession() {
  clearAuthToken();
  clearAuthUser();
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");

  if (withAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  const payload = hasJson
    ? ((await response.json()) as ApiResponse<T>)
    : null;

  const errorMessage = payload?.message || `Request failed: ${response.status}`;

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage);
  }

  if (payload && payload.success === false) {
    throw new ApiError(response.status, payload.message || "Request failed");
  }

  return payload?.data as T;
}

export const authApi = {
  register: async (body: RegisterRequest) => {
    const data = await request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }, false);

    if (data.accessToken) {
      setAuthToken(data.accessToken);
    }
    if (data.user) {
      setAuthUser(data.user);
    }

    return data;
  },

  login: async (body: LoginRequest) => {
    const data = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }, false);

    if (data.accessToken) {
      setAuthToken(data.accessToken);
    }
    if (data.user) {
      setAuthUser(data.user);
    }

    return data;
  },

  logout: async () => {
    try {
      await request<void>("/api/auth/logout", { method: "POST" });
    } finally {
      clearAuthSession();
    }
  },

  changePassword: (body: ChangePasswordRequest) =>
    request<void>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  forgotPassword: (body: ForgotPasswordRequest) =>
    request<void>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }, false),
};

export const employeesApi = {
  create: (body: EmployeeRequest) =>
    request<EmployeeResponse>("/api/employees", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getById: (employeeId: UUID) =>
    request<EmployeeResponse>(`/api/employees/${employeeId}`),

  getMyProfile: () => request<EmployeeResponse>("/api/employees/profile/me"),

  update: (employeeId: UUID, body: EmployeeRequest) =>
    request<EmployeeResponse>(`/api/employees/${employeeId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  remove: (employeeId: UUID) =>
    request<void>(`/api/employees/${employeeId}`, { method: "DELETE" }),

  getAll: () => request<EmployeeResponse[]>("/api/employees"),
};

export const projectsApi = {
  create: (body: ProjectRequest) =>
    request<ProjectResponse>("/api/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  assignEmployee: (projectId: UUID, body: AssignProjectRequest) =>
    request<ProjectAssignmentResponse>(`/api/projects/${projectId}/assign-employee`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  getById: (projectId: UUID) => request<ProjectResponse>(`/api/projects/${projectId}`),

  getAll: () => request<ProjectResponse[]>("/api/projects"),
};

export const timesheetsApi = {
  create: (body: TimesheetRequest) =>
    request<TimesheetResponse>("/api/timesheets", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getById: (timesheetId: UUID) =>
    request<TimesheetResponse>(`/api/timesheets/${timesheetId}`),

  update: (timesheetId: UUID, body: TimesheetRequest) =>
    request<TimesheetResponse>(`/api/timesheets/${timesheetId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  remove: (timesheetId: UUID) =>
    request<void>(`/api/timesheets/${timesheetId}`, { method: "DELETE" }),

  getForEmployee: (employeeId: UUID) =>
    request<TimesheetResponse[]>(`/api/timesheets/employee/${employeeId}`),

  getForEmployeeDateRange: (employeeId: UUID, startDate: string, endDate: string) =>
    request<TimesheetResponse[]>(
      `/api/timesheets/employee/${employeeId}/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    ),

  getForEmployeeFromDate: (employeeId: UUID, fromDate: string) =>
    request<TimesheetResponse[]>(
      `/api/timesheets/employee/${employeeId}/from-date?fromDate=${encodeURIComponent(fromDate)}`
    ),

  getForEmployeeProject: (employeeId: UUID, projectId: UUID) =>
    request<TimesheetResponse[]>(`/api/timesheets/employee/${employeeId}/project/${projectId}`),
};

export const adminApi = {
  inviteEmployee: (body: InviteEmployeeRequest) =>
    request<InvitationResponse>("/api/admin/employees/invite", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getPendingInvitations: () =>
    request<InvitationResponse[]>("/api/admin/employees/invitations/pending"),

  getInvitationsByStatus: (status: string) =>
    request<InvitationResponse[]>(
      `/api/admin/employees/invitations?status=${encodeURIComponent(status)}`
    ),

  revokeInvitation: (invitationId: UUID) =>
    request<void>(`/api/admin/employees/invitations/${invitationId}`, {
      method: "DELETE",
    }),

  addAdmin: (body: AddAdminRequest) =>
    request<AdminResponse>("/api/admin/admins", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getAllAdmins: () => request<AdminResponse[]>("/api/admin/admins"),

  removeAdmin: (adminId: UUID) =>
    request<void>(`/api/admin/admins/${adminId}`, { method: "DELETE" }),
};

export const api = {
  auth: authApi,
  employees: employeesApi,
  projects: projectsApi,
  timesheets: timesheetsApi,
  admin: adminApi,
};
