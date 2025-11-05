"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Calendar, CalendarClock, Loader, PlusCircle, Slice, UserRound, UsersRound } from "lucide-react"
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import type { Timestamp } from "firebase/firestore"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { PaginationControls } from "@/components/dashboard/pagination-controls"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { usePagination } from "@/hooks/use-pagination"
import type { Patient } from "@/types/pazienti"

type TimestampLike = Timestamp | Date | { toDate?: () => Date } | null | undefined

const isTimestampObject = (value: unknown): value is { toDate: () => Date } =>
  Boolean(
    value &&
      typeof value === "object" &&
      "toDate" in value &&
      typeof (value as { toDate?: unknown }).toDate === "function"
  )

const safeToDate = (value: TimestampLike): Date | null => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  if (isTimestampObject(value)) {
    try {
      return value.toDate()
    } catch (error) {
      console.error("Errore nel convertire il timestamp del paziente:", error)
      return null
    }
  }

  return null
}

const formatTimestamp = (timestamp?: TimestampLike) => {
  const date = safeToDate(timestamp ?? null)
  if (!date) return "di recente"

  try {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Errore nel formattare la data del paziente:", error)
    return "di recente"
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return "Non specificata"

  try {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsed)
  } catch (error) {
    console.error("Errore nel formattare una data paziente:", error)
    return value
  }
}

const parseDateString = (value?: string | null) => {
  if (!value) return null

  try {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

const getPatientTimestamp = (patient: Patient) => {
  const interventionDate = parseDateString(patient.dataIntervento)
  if (interventionDate) {
    return interventionDate.getTime()
  }

  const source = patient.updatedAt ?? patient.createdAt ?? null
  if (!source) return 0

  const date = safeToDate(source)
  return date ? date.getTime() : 0
}

function PatientSkeleton() {
  return (
    <Card className="border-blue-200/70 bg-white/70 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
      <CardHeader className="space-y-3">
        <Skeleton className="h-6 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/3 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-5/6 rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
      </CardContent>
    </Card>
  )
}

export default function PazientiPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const PATIENTS_PER_PAGE = 6

  useEffect(() => {
    if (!user) {
      setPatients([])
      setLoading(false)
      return
    }

    const patientsQuery = query(
      collection(db, "patients"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(
      patientsQuery,
      (snapshot) => {
        const docs: Patient[] = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Omit<Patient, "id">
          return {
            id: docSnapshot.id,
            ...data,
            nome: data.nome ?? "",
            diagnosi: data.diagnosi ?? null,
            intervento: data.intervento ?? null,
            dataIntervento: data.dataIntervento ?? null,
            operatori: data.operatori ?? null,
            apr: data.apr ?? null,
            app: data.app ?? null,
            note: data.note ?? null,
            inSospeso: Boolean(data.inSospeso),
            dataFollowUp: data.dataFollowUp ?? null,
            pendingReason: data.pendingReason ?? null,
          } as Patient
        })

        setPatients(docs)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Errore nel recupero dei pazienti:", err)
        setError("Impossibile recuperare i pazienti al momento.")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      const diff = getPatientTimestamp(b) - getPatientTimestamp(a)
      if (diff !== 0) {
        return diff
      }

      const nameA = (a.nome ?? "").toLowerCase()
      const nameB = (b.nome ?? "").toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [patients])

  const {
    currentPage,
    totalPages,
    pageItems: paginatedPatients,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
  } = usePagination(sortedPatients, PATIENTS_PER_PAGE)

  const totalPatients = sortedPatients.length

  return (
    <DashboardSection
      title="Pazienti"
      description="Aggiungi informazioni sui tuoi pazienti e monitora i follow-up."
      actions={
        <Button
          asChild
          className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700"
        >
          <Link href="/dashboard/pazienti/nuovo" className="flex items-center gap-2">
            Nuovo paziente
            <PlusCircle className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: PATIENTS_PER_PAGE }).map((_, index) => (
              <PatientSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <Card className="border-rose-200/70 bg-rose-50/70 shadow-sm shadow-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/70 dark:shadow-rose-950/40">
            <CardHeader>
              <CardTitle className="text-rose-700 dark:text-rose-200">Si è verificato un errore</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!loading && !error && totalPatients === 0 ? (
          <Card className="border-blue-200/70 bg-white/70 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/40">
                <UsersRound className="h-6 w-6" />
              </div>
              <CardTitle className="text-blue-800 dark:text-blue-200">Nessun paziente registrato</CardTitle>
              <CardDescription>
                Crea la tua prima scheda paziente per aggiungere informazioni e tener traccia dei follow-up.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!loading && !error && totalPatients > 0 ? (
          <div className="space-y-4">
            <div className="md:max-h-[65vh] md:overflow-y-auto md:pr-2">
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {paginatedPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className="group border-blue-200/70 bg-white/80 transition hover:border-blue-300 hover:shadow-lg hover:shadow-blue-200/50 dark:border-blue-900/60 dark:bg-slate-950/80 dark:hover:border-blue-700 dark:hover:shadow-blue-900/50"
                  >
                    <Link href={`/dashboard/pazienti/${patient.id}`} className="flex h-full flex-col">
                      <CardHeader className="space-y-1 pb-0">
                        <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-900 transition group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-200">
                          <span className="flex items-center gap-2">
                            <UserRound className="h-5 w-5 text-blue-500 transition group-hover:text-indigo-500" />
                            {patient.nome || "Paziente senza nome"}
                          </span>
                          {patient.inSospeso ? (
                            <Badge className="border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                              Follow-up in sospeso
                            </Badge>
                          ) : null}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
                          {patient.diagnosi ? `Diagnosi: ${patient.diagnosi}` : "Diagnosi non specificata"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3 pt-5 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Slice className="h-4 w-4 text-blue-500" />
                          <span>Intervento: {patient.intervento ?? "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Data intervento: {formatDate(patient.dataIntervento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-indigo-500" />
                          <span>Follow-up: {formatDate(patient.dataFollowUp)}</span>
                        </div>
                        {patient.inSospeso && patient.pendingReason ? (
                          <div className="flex items-center gap-2">
                            <Loader className="h-4 w-4 text-amber-500" />
                            <span>{patient.pendingReason}</span>
                          </div>
                        ) : null}
                      </CardContent>
                      <CardContent className="border-t border-dashed border-blue-100/60 pt-4 text-xs text-slate-500 dark:border-blue-900/60 dark:text-slate-400">
                        Ultimo aggiornamento: {formatTimestamp(patient.updatedAt ?? patient.createdAt)}
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={goToPrevious}
              onNext={goToNext}
              disablePrevious={!canGoPrevious}
              disableNext={!canGoNext}
              summary={`${totalPatients} ${totalPatients === 1 ? "paziente" : "pazienti"} totali - Pagina ${currentPage} di ${totalPages}`}
            />
          </div>
        ) : null}
      </div>
    </DashboardSection>
  )
}

