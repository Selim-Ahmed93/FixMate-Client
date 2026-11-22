import { API_URL } from "./config";
import type {
  AdminStats,
  ApiMessage,
  AuthSession,
  Booking,
  BookingInput,
  BookingStatus,
  Payment,
  ProfileInput,
  Role,
  Service,
  ServiceInput,
  SignUpInput,
  User,
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...init } = options;
  const isFormData = body instanceof FormData;

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "We could not reach the FixMate server. Check your connection and try again.",
      0,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw new ApiError(
      data?.message || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return data as T;
}

const body = (value: unknown): Pick<RequestOptions, "body"> => ({ body: value });

export const api = {
  auth: {
    getSession: async (): Promise<AuthSession | null> => {
      const data = await request<AuthSession | null>("/api/auth/get-session");
      return data?.user ? data : null;
    },
    signIn: (input: { email: string; password: string }) =>
      request<AuthSession>("/api/auth/sign-in/email", {
        method: "POST",
        ...body(input),
      }),
    signUp: (input: SignUpInput) =>
      request<AuthSession>("/api/auth/sign-up/email", {
        method: "POST",
        ...body(input),
      }),
    signOut: () =>
      request<ApiMessage>("/api/auth/sign-out", { method: "POST" }),
  },

  profile: {
    get: () =>
      request<{ success: boolean; message: string; user: User }>("/api/profile"),
    update: (input: ProfileInput) =>
      request<{ success: boolean; message: string; user: User }>("/api/profile", {
        method: "PATCH",
        ...body(input),
      }),
    uploadImage: (file: File) => {
      const form = new FormData();
      form.append("image", file);
      return request<{
        success: boolean;
        message: string;
        imageUrl: string;
        user: User;
      }>("/api/profile/image", { method: "PATCH", body: form });
    },
  },

  services: {
    list: () =>
      request<{
        success: boolean;
        message: string;
        totalServices: number;
        services: Service[];
      }>("/api/services"),
    get: (id: string) =>
      request<{ success: boolean; message: string; service: Service }>(
        `/api/services/${encodeURIComponent(id)}`,
      ),
    technician: () =>
      request<{
        success: boolean;
        message: string;
        totalServices: number;
        services: Service[];
      }>("/api/services/technician"),
    create: (input: ServiceInput) =>
      request<ApiMessage & { serviceId: string }>("/api/services", {
        method: "POST",
        ...body(input),
      }),
    update: (id: string, input: Partial<ServiceInput>) =>
      request<ApiMessage & { service: Service }>(
        `/api/services/${encodeURIComponent(id)}`,
        { method: "PATCH", ...body(input) },
      ),
    remove: (id: string) =>
      request<ApiMessage>(`/api/services/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },

  bookings: {
    create: (input: BookingInput) =>
      request<ApiMessage & { bookingId: string }>("/api/bookings", {
        method: "POST",
        ...body(input),
      }),
    customer: () =>
      request<{
        success: boolean;
        message: string;
        totalBookings: number;
        bookings: Booking[];
      }>("/api/bookings/customer"),
    technician: () =>
      request<{
        success: boolean;
        message: string;
        totalBookings: number;
        bookings: Booking[];
      }>("/api/bookings/technician"),
    get: (id: string) =>
      request<{ success: boolean; message: string; booking: Booking }>(
        `/api/bookings/${encodeURIComponent(id)}`,
      ),
    updateStatus: (id: string, status: BookingStatus) =>
      request<{ success: boolean; message: string; booking: Booking }>(
        `/api/bookings/${encodeURIComponent(id)}/status`,
        { method: "PATCH", ...body({ status }) },
      ),
    complete: (id: string, finalAmount: number) =>
      request<{ success: boolean; message: string; booking: Booking }>(
        `/api/bookings/${encodeURIComponent(id)}/final-amount`,
        { method: "PATCH", ...body({ finalAmount }) },
      ),
    cancel: (id: string) =>
      request<ApiMessage>(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
        method: "PATCH",
      }),
  },

  payments: {
    checkout: (bookingId: string) =>
      request<{
        success: boolean;
        message: string;
        bookingId: string;
        sessionId: string;
        checkoutUrl: string;
      }>("/api/payments/checkout", {
        method: "POST",
        ...body({ bookingId }),
      }),
    verify: (sessionId: string) =>
      request<{
        success: boolean;
        message: string;
        alreadyProcessed: boolean;
        paymentId: string;
        payment: Payment;
      }>("/api/payments/verify", {
        method: "POST",
        ...body({ sessionId }),
      }),
    history: () =>
      request<{
        success: boolean;
        message: string;
        totalPayments: number;
        payments: Payment[];
      }>("/api/payments/history"),
    forBooking: (bookingId: string) =>
      request<{ success: boolean; message: string; payment: Payment }>(
        `/api/payments/booking/${encodeURIComponent(bookingId)}`,
      ),
    all: (filters?: { status?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.search) params.set("search", filters.search);
      const query = params.size ? `?${params.toString()}` : "";
      return request<{
        success: boolean;
        message: string;
        totalPayments: number;
        payments: Payment[];
      }>(`/api/payments/all${query}`);
    },
  },

  admin: {
    stats: () =>
      request<{ success: boolean; message: string; stats: AdminStats }>(
        "/api/admin/stats",
      ),
    users: (filters?: { role?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.role) params.set("role", filters.role);
      if (filters?.search) params.set("search", filters.search);
      const query = params.size ? `?${params.toString()}` : "";
      return request<{
        success: boolean;
        message: string;
        totalUsers: number;
        users: User[];
      }>(`/api/admin/users${query}`);
    },
    updateUserRole: (id: string, role: Role) =>
      request<{ success: boolean; message: string; user: User }>(
        `/api/admin/users/${encodeURIComponent(id)}/role`,
        { method: "PATCH", ...body({ role }) },
      ),
    services: (filters?: {
      status?: string;
      available?: string;
      search?: string;
    }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.available) params.set("available", filters.available);
      if (filters?.search) params.set("search", filters.search);
      const query = params.size ? `?${params.toString()}` : "";
      return request<{
        success: boolean;
        message: string;
        totalServices: number;
        services: Service[];
      }>(`/api/admin/services${query}`);
    },
    approveService: (id: string) =>
      request<ApiMessage>(
        `/api/admin/services/${encodeURIComponent(id)}/approve`,
        { method: "PATCH" },
      ),
    rejectService: (id: string) =>
      request<ApiMessage>(
        `/api/admin/services/${encodeURIComponent(id)}/reject`,
        { method: "PATCH" },
      ),
    bookings: (filters?: { status?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.search) params.set("search", filters.search);
      const query = params.size ? `?${params.toString()}` : "";
      return request<{
        success: boolean;
        message: string;
        totalBookings: number;
        bookings: Booking[];
      }>(`/api/admin/bookings${query}`);
    },
  },
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
