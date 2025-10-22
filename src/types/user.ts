import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}