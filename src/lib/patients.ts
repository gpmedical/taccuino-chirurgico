import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"

import { db } from "@/lib/firebase"

const PATIENTS_COLLECTION = "patients"

export interface PatientPayload {
  nome: string
  diagnosi?: string | null
  intervento?: string | null
  dataIntervento?: string | null
  operatori?: string | null
  apr?: string | null
  app?: string | null
  note?: string | null
  inSospeso?: boolean
  dataFollowUp?: string | null
  pendingReason?: string | null
}

const sanitize = (value?: string | null) => value?.trim() ?? ""

const sanitizeDate = (value?: string | null) => {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

const sanitizeOptional = (value?: string | null) => {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

export async function createPatient(userId: string, payload: PatientPayload) {
  const timestamp = serverTimestamp()
  const inSospeso = Boolean(payload.inSospeso)

  const patientRef = await addDoc(collection(db, PATIENTS_COLLECTION), {
    userId,
    nome: sanitize(payload.nome),
    diagnosi: sanitizeOptional(payload.diagnosi),
    intervento: sanitizeOptional(payload.intervento),
    dataIntervento: sanitizeDate(payload.dataIntervento),
    operatori: sanitizeOptional(payload.operatori),
    apr: sanitizeOptional(payload.apr),
    app: sanitizeOptional(payload.app),
    note: sanitizeOptional(payload.note),
    inSospeso,
    pendingReason: inSospeso ? sanitizeOptional(payload.pendingReason) : null,
    dataFollowUp: sanitizeDate(payload.dataFollowUp),
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  return patientRef.id
}

export async function updatePatient(patientId: string, payload: PatientPayload) {
  const patientRef = doc(db, PATIENTS_COLLECTION, patientId)
  const inSospeso = Boolean(payload.inSospeso)

  await updateDoc(patientRef, {
    nome: sanitize(payload.nome),
    diagnosi: sanitizeOptional(payload.diagnosi),
    intervento: sanitizeOptional(payload.intervento),
    dataIntervento: sanitizeDate(payload.dataIntervento),
    operatori: sanitizeOptional(payload.operatori),
    apr: sanitizeOptional(payload.apr),
    app: sanitizeOptional(payload.app),
    note: sanitizeOptional(payload.note),
    inSospeso,
    pendingReason: inSospeso ? sanitizeOptional(payload.pendingReason) : null,
    dataFollowUp: sanitizeDate(payload.dataFollowUp),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePatient(patientId: string) {
  const patientRef = doc(db, PATIENTS_COLLECTION, patientId)
  await deleteDoc(patientRef)
}
