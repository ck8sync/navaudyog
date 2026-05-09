export const JOB_CATEGORIES = [
  "Construction & Labour",
  "Manufacturing & Factory",
  "Delivery & Logistics",
  "Security & Housekeeping",
  "Retail & Sales",
  "Driver & Transport",
] as const;

export const PAY_TYPES = ["Daily Wage", "Weekly", "Monthly Salary", "Per Contract"] as const;

export const EXPERIENCE_OPTIONS = ["No experience", "1-2 years", "3-5 years", "5+ years"] as const;

export const AVAILABILITY_OPTIONS = ["Immediately", "Within 1 week", "Within 1 month"] as const;

export const COMPANY_TYPES = ["Factory", "Contractor", "Agency", "Direct Employer"] as const;

export const APPLICATION_STATUSES = ["applied", "reviewing", "interview", "hired", "rejected"] as const;

export const KANBAN_COLUMNS = [
  { id: "applied", label: "Applied", color: "bg-blue-100 border-blue-300" },
  { id: "reviewing", label: "Reviewing", color: "bg-yellow-100 border-yellow-300" },
  { id: "interview", label: "Interview Scheduled", color: "bg-purple-100 border-purple-300" },
  { id: "hired", label: "Hired", color: "bg-green-100 border-green-300" },
  { id: "rejected", label: "Rejected", color: "bg-red-100 border-red-300" },
] as const;

export const BRAND = {
  primary: "#1976D2", // Updated to match logo blue
  accent: "#FF6F00",
  tagline: "New Job, New Start.",
  name: "Nava Udyog",
};

export const ROLE_PATHS: Record<string, string> = {
  employee: "/dashboard/employee",
  employer: "/dashboard/employer",
  admin: "/dashboard/admin",
};