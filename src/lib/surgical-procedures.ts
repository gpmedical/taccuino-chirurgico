import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"

import { db } from "@/lib/firebase"

const PROCEDURES_COLLECTION = "surgicalProcedures"
const TECHNIQUES_COLLECTION = "techniques"

export interface ProcedurePayload {
  procedura: string
  tecnica: string
  preOperatorio?: string
  posizione?: string
  accesso?: string
  stepChirurgici?: string
  tipsAndTricks?: string
  attenzione?: string
  postOperatorio?: string
  altro?: string
}

export type TechniquePayload = Omit<ProcedurePayload, "procedura">

const sanitizeField = (value?: string) => value?.trim() ?? ""

export async function createProcedureWithTechnique(
  userId: string,
  data: ProcedurePayload
) {
  const timestamp = serverTimestamp()
  const procedureRef = await addDoc(collection(db, PROCEDURES_COLLECTION), {
    procedura: data.procedura.trim(),
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  await addDoc(collection(procedureRef, TECHNIQUES_COLLECTION), {
    tecnica: data.tecnica.trim(),
    preOperatorio: sanitizeField(data.preOperatorio),
    posizione: sanitizeField(data.posizione),
    accesso: sanitizeField(data.accesso),
    stepChirurgici: sanitizeField(data.stepChirurgici),
    tipsAndTricks: sanitizeField(data.tipsAndTricks),
    attenzione: sanitizeField(data.attenzione),
    postOperatorio: sanitizeField(data.postOperatorio),
    altro: sanitizeField(data.altro),
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  return procedureRef.id
}

export async function createTechnique(
  procedureId: string,
  data: TechniquePayload
) {
  const timestamp = serverTimestamp()
  const procedureRef = doc(db, PROCEDURES_COLLECTION, procedureId)

  await addDoc(collection(procedureRef, TECHNIQUES_COLLECTION), {
    tecnica: data.tecnica.trim(),
    preOperatorio: sanitizeField(data.preOperatorio),
    posizione: sanitizeField(data.posizione),
    accesso: sanitizeField(data.accesso),
    stepChirurgici: sanitizeField(data.stepChirurgici),
    tipsAndTricks: sanitizeField(data.tipsAndTricks),
    attenzione: sanitizeField(data.attenzione),
    postOperatorio: sanitizeField(data.postOperatorio),
    altro: sanitizeField(data.altro),
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  await updateDoc(procedureRef, { updatedAt: timestamp })
}

export async function updateTechnique(
  procedureId: string,
  techniqueId: string,
  data: TechniquePayload
) {
  const timestamp = serverTimestamp()
  const techniqueRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId,
    TECHNIQUES_COLLECTION,
    techniqueId
  )

  await updateDoc(techniqueRef, {
    tecnica: data.tecnica.trim(),
    preOperatorio: sanitizeField(data.preOperatorio),
    posizione: sanitizeField(data.posizione),
    accesso: sanitizeField(data.accesso),
    stepChirurgici: sanitizeField(data.stepChirurgici),
    tipsAndTricks: sanitizeField(data.tipsAndTricks),
    attenzione: sanitizeField(data.attenzione),
    postOperatorio: sanitizeField(data.postOperatorio),
    altro: sanitizeField(data.altro),
    updatedAt: timestamp,
  })

  const procedureRef = doc(db, PROCEDURES_COLLECTION, procedureId)
  await updateDoc(procedureRef, { updatedAt: timestamp })
}

export async function deleteTechnique(
  procedureId: string,
  techniqueId: string
) {
  const techniqueRef = doc(
    db,
    PROCEDURES_COLLECTION,
    procedureId,
    TECHNIQUES_COLLECTION,
    techniqueId
  )
  await deleteDoc(techniqueRef)
  const procedureRef = doc(db, PROCEDURES_COLLECTION, procedureId)
  await updateDoc(procedureRef, { updatedAt: serverTimestamp() })
}
