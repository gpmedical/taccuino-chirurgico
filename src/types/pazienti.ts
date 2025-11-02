import { Timestamp } from "firebase/firestore"

export interface Patient {
  id: string
  userId: string
  nome: string
  diagnosi?: string | null
  intervento?: string | null
  dataIntervento?: string | null
  operatori?: string | null
  apr?: string | null
  app?: string | null
  note?: string | null
  pendingReason?: string | null
  inSospeso: boolean
  dataFollowUp?: string | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}
