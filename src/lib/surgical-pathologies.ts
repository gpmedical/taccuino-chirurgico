import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"

import { db } from "@/lib/firebase"

const PATHOLOGIES_COLLECTION = "surgicalPathologies"
const NOTES_COLLECTION = "notes"

export interface PathologyPayload {
  patologia: string
}

export interface PathologyNotePayload {
  titolo: string
  contenuto: string
}

const sanitize = (value?: string) => value?.trim() ?? ""

async function refreshPathologyAggregates(pathologyId: string) {
  const pathologyRef = doc(db, PATHOLOGIES_COLLECTION, pathologyId)
  const notesRef = collection(pathologyRef, NOTES_COLLECTION)

  const [countSnap, latestSnap] = await Promise.all([
    getCountFromServer(notesRef),
    getDocs(query(notesRef, orderBy("updatedAt", "desc"), limit(1))),
  ])

  const notesCount = countSnap.data().count
  const latest = latestSnap.docs[0]
  const lastNote = latest
    ? {
        id: latest.id,
        ...latest.data(),
      }
    : null

  await updateDoc(pathologyRef, {
    notesCount,
    lastNote,
    updatedAt: serverTimestamp(),
  })
}

export async function createPathology(
  userId: string,
  payload: PathologyPayload,
  initialNote?: PathologyNotePayload | null
) {
  const timestamp = serverTimestamp()
  const sanitizedPatologia = sanitize(payload.patologia)

  const pathologyRef = await addDoc(collection(db, PATHOLOGIES_COLLECTION), {
    patologia: sanitizedPatologia,
    userId,
    notesCount: 0,
    lastNote: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  if (initialNote && (initialNote.titolo.trim() || initialNote.contenuto.trim())) {
    const sanitizedNote = {
      titolo: sanitize(initialNote.titolo),
      contenuto: sanitize(initialNote.contenuto),
    }

    const noteRef = await addDoc(collection(pathologyRef, NOTES_COLLECTION), {
      ...sanitizedNote,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    await refreshPathologyAggregates(pathologyRef.id)
  }

  return pathologyRef.id
}

export async function updatePathology(pathologyId: string, payload: PathologyPayload) {
  const pathologyRef = doc(db, PATHOLOGIES_COLLECTION, pathologyId)
  await updateDoc(pathologyRef, {
    patologia: sanitize(payload.patologia),
    updatedAt: serverTimestamp(),
  })
}

export async function deletePathology(pathologyId: string) {
  const pathologyRef = doc(db, PATHOLOGIES_COLLECTION, pathologyId)
  const notesRef = collection(pathologyRef, NOTES_COLLECTION)
  const notesSnapshot = await getDocs(notesRef)

  await Promise.all(notesSnapshot.docs.map((note) => deleteDoc(note.ref)))
  await deleteDoc(pathologyRef)
}

export async function createPathologyNote(
  pathologyId: string,
  payload: PathologyNotePayload
) {
  const pathologyRef = doc(db, PATHOLOGIES_COLLECTION, pathologyId)
  const notesRef = collection(pathologyRef, NOTES_COLLECTION)
  const sanitizedNote = {
    titolo: sanitize(payload.titolo),
    contenuto: sanitize(payload.contenuto),
  }

  const noteRef = await addDoc(notesRef, {
    ...sanitizedNote,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await refreshPathologyAggregates(pathologyId)
  return noteRef.id
}

export async function updatePathologyNote(
  pathologyId: string,
  noteId: string,
  payload: PathologyNotePayload
) {
  const noteRef = doc(
    db,
    PATHOLOGIES_COLLECTION,
    pathologyId,
    NOTES_COLLECTION,
    noteId
  )

  await updateDoc(noteRef, {
    titolo: sanitize(payload.titolo),
    contenuto: sanitize(payload.contenuto),
    updatedAt: serverTimestamp(),
  })

  await refreshPathologyAggregates(pathologyId)
}

export async function deletePathologyNote(pathologyId: string, noteId: string) {
  const noteRef = doc(
    db,
    PATHOLOGIES_COLLECTION,
    pathologyId,
    NOTES_COLLECTION,
    noteId
  )

  await deleteDoc(noteRef)
  await refreshPathologyAggregates(pathologyId)
}
