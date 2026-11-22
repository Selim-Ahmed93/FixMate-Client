export type Role = "customer" | "technician" | "admin";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"
  | "cancelled";
export type PaymentStatus = "paid" | "unpaid";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: User;
  session?: {
    id: string;
    userId: string;
    expiresAt?: string;
  };
}

export interface Service {
  _id: string;
  title: string;
  category: string;
  description: string;
  image?: string | null;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt?: string;
}

export interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage?: string | null;
  category: string;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount?: number | null;
  paymentStatus: PaymentStatus;
  createdAt?: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalTechnicians: number;
  totalAdmins: number;
  totalServices: number;
  pendingServices: number;
  approvedServices: number;
  totalBookings: number;
  completedBookings: number;
  totalPayments: number;
  totalRevenue: number;
}

export interface ServiceInput {
  title: string;
  category: string;
  description: string;
  image?: string | null;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea: string;
}

export interface BookingInput {
  serviceId: string;
  customerPhone?: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role: "customer" | "technician";
  phone?: string;
  area?: string;
  bio?: string;
}

export interface ProfileInput {
  name?: string;
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
  image?: string | null;
}

export interface ApiMessage {
  success: boolean;
  message: string;
}
