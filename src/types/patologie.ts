import { Timestamp } from "firebase/firestore"

export interface SurgicalPathologyNote {
  id: string
  titolo: string
  contenuto: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface SurgicalPathology {
  id: string
  patologia: string
  userId: string
  notesCount?: number
  lastNote?: SurgicalPathologyNote | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}
