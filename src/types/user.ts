import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  role: "Resident" | "Consultant" | "Program Director" | "Faculty";
  specialty: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 