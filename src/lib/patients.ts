import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
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

const assignOptionalField = (
  target: Record<string, unknown>,
  field: string,
  value: string | null
) => {
  if (value !== null) {
    target[field] = value
  } else {
    target[field] = deleteField()
  }
}

export async function createPatient(userId: string, payload: PatientPayload) {
  const timestamp = serverTimestamp()
  const inSospeso = Boolean(payload.inSospeso)

  const patientData: Record<string, unknown> = {
    userId,
    nome: sanitize(payload.nome),
    inSospeso,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const diagnosi = sanitizeOptional(payload.diagnosi)
  if (diagnosi !== null) patientData.diagnosi = diagnosi

  const intervento = sanitizeOptional(payload.intervento)
  if (intervento !== null) patientData.intervento = intervento

  const dataIntervento = sanitizeDate(payload.dataIntervento)
  if (dataIntervento !== null) patientData.dataIntervento = dataIntervento

  const operatori = sanitizeOptional(payload.operatori)
  if (operatori !== null) patientData.operatori = operatori

  const apr = sanitizeOptional(payload.apr)
  if (apr !== null) patientData.apr = apr

  const app = sanitizeOptional(payload.app)
  if (app !== null) patientData.app = app

  const note = sanitizeOptional(payload.note)
  if (note !== null) patientData.note = note

  const dataFollowUp = sanitizeDate(payload.dataFollowUp)
  if (dataFollowUp !== null) patientData.dataFollowUp = dataFollowUp

  if (inSospeso) {
    const pendingReason = sanitizeOptional(payload.pendingReason)
    if (pendingReason !== null) {
      patientData.pendingReason = pendingReason
    }
  }

  const patientRef = await addDoc(collection(db, PATIENTS_COLLECTION), patientData)

  return patientRef.id
}

export async function updatePatient(patientId: string, payload: PatientPayload) {
  const patientRef = doc(db, PATIENTS_COLLECTION, patientId)
  const inSospeso = Boolean(payload.inSospeso)

  const updates: Record<string, unknown> = {
    nome: sanitize(payload.nome),
    inSospeso,
    updatedAt: serverTimestamp(),
  }

  assignOptionalField(updates, "diagnosi", sanitizeOptional(payload.diagnosi))
  assignOptionalField(updates, "intervento", sanitizeOptional(payload.intervento))
  assignOptionalField(updates, "dataIntervento", sanitizeDate(payload.dataIntervento))
  assignOptionalField(updates, "operatori", sanitizeOptional(payload.operatori))
  assignOptionalField(updates, "apr", sanitizeOptional(payload.apr))
  assignOptionalField(updates, "app", sanitizeOptional(payload.app))
  assignOptionalField(updates, "note", sanitizeOptional(payload.note))
  assignOptionalField(updates, "dataFollowUp", sanitizeDate(payload.dataFollowUp))

  if (inSospeso) {
    const pendingReason = sanitizeOptional(payload.pendingReason)
    if (pendingReason !== null) {
      updates.pendingReason = pendingReason
    } else {
      updates.pendingReason = deleteField()
    }
  } else {
    updates.pendingReason = deleteField()
  }

  await updateDoc(patientRef, updates)
}

export async function deletePatient(patientId: string) {
  const patientRef = doc(db, PATIENTS_COLLECTION, patientId)
  await deleteDoc(patientRef)
}
