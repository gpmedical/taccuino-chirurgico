import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  provider: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
