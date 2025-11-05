"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import type { Timestamp } from "firebase/firestore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  Loader,
  NotebookPen,
  Slice,
  SquarePen,
  Trash2,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { deletePatient } from "@/lib/patients"
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
      console.error("Errore nel convertire un timestamp paziente:", error)
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch (error) {
    console.error("Errore nel formattare il timestamp del paziente:", error)
    return "di recente"
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return "-"

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

export default function PazienteDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams<{ patientId: string }>()
  const patientId = params?.patientId

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!patientId) {
      setPatient(null)
      setError("Il paziente non è stato trovato.")
      setLoading(false)
      return
    }

    if (!user?.uid) {
      return
    }

    setLoading(true)
    const patientRef = doc(db, "patients", patientId)

    const unsubscribe = onSnapshot(
      patientRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setPatient(null)
          setError("Il paziente non è stato trovato.")
          setLoading(false)
          return
        }

        const data = snapshot.data() as Omit<Patient, "id">

        if (data.userId !== user.uid) {
          setPatient(null)
          setError("Non hai i permessi per visualizzare questo paziente.")
          setLoading(false)
          return
        }

        const patientData: Patient = {
          id: snapshot.id,
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
        }

        setPatient(patientData)
        setError(null)
        setLoading(false)
      },
      (err) => {
        console.error("Errore nel recupero del paziente:", err)
        setPatient(null)
        setError("Impossibile caricare il paziente al momento.")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [patientId, user?.uid])

  const lastUpdateLabel = useMemo(() => {
    if (!patient) return null
    return formatTimestamp(patient.updatedAt ?? patient.createdAt)
  }, [patient])

  const handleDelete = async () => {
    if (!patientId) return

    setIsDeleting(true)
    try {
      await deletePatient(patientId)
      toast.success("Paziente eliminato")
      router.push("/dashboard/pazienti")
    } catch (error) {
      console.error("Errore durante l'eliminazione del paziente:", error)
      toast.error("Nonè stato possibile eliminare il paziente. Riprova più tardi.")
    } finally {
      setIsDeleting(false)
    }
  }

  const isReady = !loading && !error && patient

  return (
    <DashboardSection
      title="Scheda paziente"
      description="Consulta i dettagli clinici, l'intervento e il follow-up."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
          >
            <Link href="/dashboard/pazienti" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Elenco pazienti
            </Link>
          </Button>
          <Button
            asChild
            className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:opacity-60"
            disabled={!patient}
          >
            <Link href={patient ? `/dashboard/pazienti/${patient.id}/modifica` : "#"} className="flex items-center gap-2">
              <SquarePen className="h-4 w-4" />
              Modifica
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="flex items-center gap-2"
                disabled={!patient || isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-rose-200/70 bg-white/95 shadow-xl shadow-rose-200/60 backdrop-blur dark:border-rose-900/60 dark:bg-rose-950/95 dark:shadow-rose-950/60">
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminare questo paziente?</AlertDialogTitle>
                <AlertDialogDescription>
                  L'operazione non puo essere annullata e rimuovera definitivamente tutte le informazioni registrate.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900">
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-linear-to-r from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-500/40 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  Conferma
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      {loading ? (
        <div className="grid gap-6">
          <Card className="border-blue-200/70 bg-white/70 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-48 rounded-full" />
              <Skeleton className="h-4 w-64 rounded-full" />
            </CardHeader>
            <CardContent className="grid gap-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {!loading && error ? (
        <Card className="border-rose-200/70 bg-rose-50/70 shadow-sm shadow-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/70 dark:shadow-rose-950/40">
          <CardHeader>
            <CardTitle className="text-rose-700 dark:text-rose-200">Impossibile mostrare il paziente</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {isReady ? (
        <div className="grid gap-6">
          <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40">
            <CardHeader className="space-y-2">
              <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-slate-900 dark:text-slate-100">
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <UserRound className="h-5 w-5 text-blue-500" />
                  {patient?.nome || "Paziente senza nome"}
                </span>
                {patient?.inSospeso ? (
                  <Badge className="border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                    Follow-up in sospeso
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                Aggiornato {lastUpdateLabel ?? "di recente"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
                    <Slice className="h-4 w-4" />
                    Intervento
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Intervento: </span>
                      {patient?.intervento ?? "-"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Data intervento: {formatDate(patient?.dataIntervento)}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-indigo-500" />
                      Prossimo follow-up: {formatDate(patient?.dataFollowUp)}
                    </p>
                    {patient?.inSospeso && patient.pendingReason ? (
                      <p className="flex items-center gap-2 text-amber-700 dark:text-amber-200">
                        <Loader className="h-4 w-4" />
                        {patient.pendingReason}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-3 rounded-xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
                    <NotebookPen className="h-4 w-4" />
                    Dati clinici
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Diagnosi: </span>
                      {patient?.diagnosi ?? "-"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Operatori: </span>
                      {patient?.operatori ?? "-"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900 dark:text-slate-100">APR: </span>
                      {patient?.apr ?? "-"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900 dark:text-slate-100">APP: </span>
                      {patient?.app ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
              {patient?.note ? (
                <div className="rounded-xl border border-blue-100/70 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-blue-900/60 dark:bg-slate-900/70 dark:text-slate-300">
                  <h3 className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-200">Note aggiuntive</h3>
                  <p className="whitespace-pre-line leading-relaxed">{patient.note}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardSection>
  )
}
