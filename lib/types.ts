export type RegistrantType = "alumni";

export interface PerformanceApplication {
  applied: boolean;
  category: string;
  title: string;
  description: string;
  resumeUrl: string;
  durationMinutes?: string;
  specialRequirements?: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminRemarks?: string;
}

export interface AlumniRegistration {
  id: string;
  regNumber: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;

  // Academic Era & Degree
  era: "SBSCET" | "SBSSTC" | "SBSSU";
  passingYear: string;
  degree: string;
  branch: string;
  rollNumber?: string;

  // Professional & Location
  currentDesignation?: string;
  organization?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedin?: string;
  memoriesMessage?: string;

  // Pass & Attendance (Separate: Registration is Free; Pass is ₹1000)
  hasPass: boolean; // true if ₹1,000 meet pass purchased
  passStatus: "none" | "active" | "cancelled";
  passPrice: number; // ₹1,000
  passIssuedAt?: string;
  amount: number; // 0 initially, 1000 when pass is paid
  paymentStatus: "free" | "pending" | "completed" | "failed";
  paymentDetails?: {
    transactionId: string;
    paymentMethod: string;
    paidAt: string;
    referenceNumber?: string;
    orderId?: string;
  } | null;

  // Gate Check-in
  checkedIn: boolean;
  checkedInAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;

  // Cultural Performance Application (default attendee; alumni with pass can apply to perform)
  performerStatus: "none" | "pending" | "approved" | "rejected";
  performanceApplication?: PerformanceApplication;
  culturalInterest?: string;
  culturalDetails?: string;

  // Event Logistics
  attendanceType?: "in-person" | "virtual" | "supporting";
  guestCount?: number;
  dietaryPreference?: "veg" | "non-veg";

  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlumniRegistrationInput = Omit<
  AlumniRegistration,
  | "id"
  | "regNumber"
  | "paymentStatus"
  | "hasPass"
  | "passStatus"
  | "passPrice"
  | "passIssuedAt"
  | "checkedIn"
  | "checkedInAt"
  | "verifiedBy"
  | "verifiedAt"
  | "performerStatus"
  | "performanceApplication"
  | "createdAt"
  | "updatedAt"
>;

export interface AuthorizedAdmin {
  id: string;
  email: string;
  role: "superadmin" | "admin" | "faculty" | "coordinator";
  name?: string;
  remark?: string;
  addedAt: string;
  addedBy: string;
  active: boolean;
}
