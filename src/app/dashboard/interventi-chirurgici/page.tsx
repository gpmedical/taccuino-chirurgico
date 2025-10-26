"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CalendarClock, Layers3, PlusCircle } from "lucide-react"
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import type { SurgicalProcedure } from "@/types/interventi"

const formatTimestamp = (timestamp?: { toDate?: () => Date }) => {
  if (!timestamp?.toDate) return "di recente"
  try {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(timestamp.toDate())
  } catch (error) {
    console.error("Errore nel formattare la data dell'intervento:", error)
    return "di recente"
  }
}

function ProcedureSkeleton() {
  return (
    <Card className="border-blue-200/70 bg-white/70 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
      <CardHeader className="space-y-3">
        <Skeleton className="h-6 w-2/3 rounded-full" />
        <Skeleton className="h-4 w-1/3 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-5/6 rounded-full" />
      </CardContent>
    </Card>
  )
}

export default function InterventiChirurgiciPage() {
  const { user } = useAuth()
  const [procedures, setProcedures] = useState<SurgicalProcedure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setProcedures([])
      setLoading(false)
      return
    }

    const proceduresQuery = query(
      collection(db, "surgicalProcedures"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(
      proceduresQuery,
      (snapshot) => {
        const docs: SurgicalProcedure[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SurgicalProcedure[]

        setProcedures(docs)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("Errore nel recupero degli interventi:", err)
        setError("Impossibile recuperare gli interventi al momento.")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const sortedProcedures = useMemo(() => {
    return [...procedures].sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0
      const bTime = b.updatedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0
      return bTime - aTime
    })
  }, [procedures])

  return (
    <DashboardSection
      title="Interventi chirurgici"
      description="Gestisci tutte le tue procedure annotate, aggiungi nuove tecniche e consulta rapidamente i dettagli già registrati."
      actions={
        <Button
          asChild
          className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700"
        >
          <Link href="/dashboard/interventi-chirurgici/nuovo" className="flex items-center gap-2">
            Nuovo intervento
            <PlusCircle className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProcedureSkeleton key={index} />
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

        {!loading && !error && sortedProcedures.length === 0 ? (
          <Card className="border-blue-200/70 bg-white/70 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/40">
                <Layers3 className="h-6 w-6" />
              </div>
              <CardTitle className="text-blue-800 dark:text-blue-200">Nessun intervento registrato</CardTitle>
              <CardDescription>
                Aggiungi il tuo primo intervento chirurgico per iniziare a costruire il tuo taccuino digitale.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                asChild
                className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700"
              >
                <Link href="/dashboard/interventi-chirurgici/nuovo" className="flex items-center gap-2">
                  Nuovo intervento
                  <PlusCircle className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!loading && !error && sortedProcedures.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedProcedures.map((procedure) => (
              <Card
                key={procedure.id}
                className="group border-blue-200/70 bg-white/80 transition hover:border-blue-300 hover:shadow-lg hover:shadow-blue-200/50 dark:border-blue-900/60 dark:bg-slate-950/80 dark:hover:border-blue-700 dark:hover:shadow-blue-900/50"
              >
                <Link href={`/dashboard/interventi-chirurgici/${procedure.id}`} className="flex h-full flex-col">
                  <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-900 transition group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-200">
                      {procedure.procedura}
                      <Layers3 className="h-5 w-5 text-blue-500 transition group-hover:text-indigo-500" />
                    </CardTitle>
                    <CardDescription>
                      Tocca per visualizzare tecniche, accorgimenti e checklist operative personalizzate.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CalendarClock className="h-4 w-4 text-blue-500" />
                      Aggiornato il {formatTimestamp(procedure.updatedAt ?? procedure.createdAt)}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </DashboardSection>
  )
}
