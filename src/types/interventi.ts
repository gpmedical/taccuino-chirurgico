import { Timestamp } from "firebase/firestore"

export interface SurgicalProcedure {
  id: string
  procedura: string
  userId: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface SurgicalTechnique {
  id: string
  proceduraId: string
  tecnica: string
  preOperatorio: string
  posizione: string
  accesso: string
  stepChirurgici: string
  tipsAndTricks: string
  attenzione: string
  postOperatorio: string
  altro: string
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}
