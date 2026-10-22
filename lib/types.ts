export type RegistrantType = "alumni" | "student";

export interface AlumniRegistration {
  id: string;
  regNumber: string;
  registrantType: RegistrantType;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  // Alumni-specific fields
  era?: "SBSCET" | "SBSSTC" | "SBSSU";
  passingYear?: string;
  currentDesignation?: string;
  organization?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedin?: string;
  // Student-specific fields
  currentSemester?: string;
  hostelOrDayScholar?: string;
  volunteerInterest?: boolean;
  // Common Academic & Event fields
  degree: string;
  branch: string;
  rollNumber?: string;
  attendanceType: "in-person" | "virtual" | "supporting";
  culturalInterest:
    | "none"
    | "dance"
    | "music"
    | "drama"
    | "anchoring"
    | "fine-arts"
    | "poetry"
    | "other";
  culturalDetails?: string;
  guestCount: number;
  dietaryPreference?: "veg" | "non-veg";
  memoriesMessage?: string;
  contributionTier?: string;
  amount: number; // 1000 for alumni, 0 for students
  paymentStatus: "pending" | "completed" | "failed" | "free";
  paymentDetails?: {
    transactionId: string;
    paymentMethod: string;
    paidAt: string;
    referenceNumber?: string;
  } | null;
  checkedIn: boolean;
  checkedInAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlumniRegistrationInput = Omit<
  AlumniRegistration,
  | "id"
  | "regNumber"
  | "paymentStatus"
  | "checkedIn"
  | "createdAt"
  | "updatedAt"
  | "verifiedBy"
  | "verifiedAt"
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
