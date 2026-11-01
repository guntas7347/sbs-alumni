export type RegistrantType = "alumni";

export type AllowedGuestRelation = "Mom" | "Dad" | "Spouse" | "Child" | "";

export interface GuestDetail {
  name: string;
  relation: AllowedGuestRelation;
}

export interface AlumniRegistration {
  id: string;
  regNumber: string;

  // 1. Basic Alumnus Info
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;

  // 2. Academic & Professional
  era: string; // "SBSCET" | "SBSSTC" | "SBSSU"
  degree: string;
  branch: string;
  passingYear: string;
  rollNumber?: string;
  currentDesignation?: string;
  organization?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedin?: string;
  memoriesMessage?: string;

  // 3. Attendance & Event Pass
  attendingMeet: boolean;
  attendanceType?: "in-person" | "in-person-pending" | "supporting";
  hasPass: boolean;
  passStatus: string; // "none" | "active" | "cancelled" | "pending"
  amount: string; // "1000" or "0"

  // 4. Special Request Field (Default "")
  specialRequest?: string;

  // 5. Accompanying Guests (Flat string fields, Max 3, Mom/Dad/Spouse/Child)
  guestCount?: string; // "0" | "1" | "2" | "3"
  guest1Name?: string;
  guest1Relation?: string;
  guest2Name?: string;
  guest2Relation?: string;
  guest3Name?: string;
  guest3Relation?: string;
  guestsSummary?: string;

  // Optional array for UI rendering helpers if needed
  guests?: GuestDetail[];

  // 6. Stage Performance Request
  wantToPerform?: boolean;
  performanceType?: string;
  performanceStatus?: "none" | "pending" | "approved" | "rejected";
  performanceAdminRemarks?: string;

  // 7. Vice Chancellor Interaction Request
  wantToInteractWithVC?: boolean;
  vcInteractionPortfolio?: string;
  vcInteractionReason?: string;
  vcInteractionStatus?: "none" | "pending" | "approved" | "rejected";
  vcInteractionAdminRemarks?: string;

  // 8. UPI QR Payment & Manual Verification
  txnId?: string;
  paymentMode?: string;
  screenshotUrl?: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  lastPaymentReminderSentAt?: string;

  // Legacy field support for backward compatibility if any
  paymentStatus?: string;
  adminNotes?: string;
  culturalInterest?: boolean;
  culturalDetails?: string;
  passPrice?: string | number;
  paymentScreenshotUrl?: string;
  performanceApplication?: any;
  paymentDetails?: {
    transactionId?: string;
    paymentMethod?: string;
    screenshotUrl?: string;
    verified?: boolean;
    verifiedBy?: string;
  } | null;
  performerStatus?: "none" | "pending" | "approved" | "rejected";
  dietaryPreference?: "veg" | "non-veg";

  // 9. Gate Check-in
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;

  // 10. System Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceApplication {
  applied: boolean;
  performanceType?: string;
  title?: string;
  category?: string;
  description?: string;
  durationMinutes?: string;
  resumeUrl?: string;
  resumeOrPortfolioUrl?: string;
  stageRequirements?: string;
  specialRequirements?: string;
  status: "none" | "pending" | "approved" | "rejected";
  appliedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminRemarks?: string;
}

export type AlumniRegistrationInput = Partial<AlumniRegistration>;

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
