"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  History,
  NotebookPen,
  Slice,
  Stethoscope,
  UsersRound,
} from "lucide-react"
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"

const quickActions = [
  {
    title: "Registra intervento",
    description: "Annota dettagli tecnici, steps chirurgici e \"tips and tricks\".",
    href: "/dashboard/interventi-chirurgici/nuovo",
    icon: Slice,
  },
  {
    title: "Crea patologia",
    description: "Salva i protocolli per la gestione delle più comuni patologie.",
    href: "/dashboard/patologie-chirurgiche/nuova",
    icon: Stethoscope,
  },
  {
    title: "Carica caso clinico",
    description: "Registra presentazione e gestione di casi clinici interessanti.",
    href: "/dashboard/casi-clinici/nuovo",
    icon: ClipboardList,
  },
]

const upcoming = [
  {
    title: "Follow-up post-operatorio",
    date: "15 aprile 2024",
    patient: "Paziente #A219",
  },
  {
    title: "Revisione team multidisciplinare",
    date: "22 aprile 2024",
    patient: "Caso clinico #B502",
  },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [procedureCount, setProcedureCount] = useState<number | null>(null)
  const [pathologyCount, setPathologyCount] = useState<number | null>(null)
  const [patientCount, setPatientCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setProcedureCount(0)
      return
    }

    const proceduresQuery = query(
      collection(db, "surgicalProcedures"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(
      proceduresQuery,
      (snapshot) => {
        setProcedureCount(snapshot.size)
      },
      (error) => {
        console.error("Errore nel conteggio degli interventi:", error)
        setProcedureCount(null)
      }
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user) {
      setPathologyCount(0)
      return
    }

    const pathologiesQuery = query(
      collection(db, "surgicalPathologies"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(
      pathologiesQuery,
      (snapshot) => {
        setPathologyCount(snapshot.size)
      },
      (error) => {
        console.error("Errore nel conteggio delle patologie:", error)
        setPathologyCount(null)
      }
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user) {
      setPatientCount(0)
      return
    }

    const patientsQuery = query(
      collection(db, "patients"),
      where("userId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(
      patientsQuery,
      (snapshot) => {
        setPatientCount(snapshot.size)
      },
      (error) => {
        console.error("Errore nel conteggio dei pazienti:", error)
        setPatientCount(null)
      }
    )

    return () => unsubscribe()
  }, [user])

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/80 p-6 shadow-lg shadow-blue-100/60 backdrop-blur-sm dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40 sm:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.25),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_55%)]" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
              Benvenuto{user?.displayName ? `, ${user.displayName}` : ""}
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
              Organizza la tua attività chirurgica in un solo click
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Salva dettagli su interventi chirurgici, la gestione delle patologie chirurgiche più comuni, i casi clinici più interessanti e i tuoi pazienti da seguire nel tempo.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700">
                <Link href="/dashboard/interventi-chirurgici/nuovo" className="flex items-center gap-2">
                  Nuovo intervento
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-blue-300/80 text-blue-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/70 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900">
                <Link href="/dashboard/pazienti">Gestisci pazienti</Link>
              </Button>
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-4 rounded-2xl border border-blue-200/60 bg-white/70 p-4 shadow-md shadow-blue-200/50 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/40">
                <Slice className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Interventi registrati</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {procedureCount ?? "--"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-400 via-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/40">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Patologie chirurgiche</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {pathologyCount ?? "--"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-300 via-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/40">
                <UsersRound className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Pazienti salvati</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {patientCount ?? "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/50 backdrop-blur-sm transition hover:shadow-xl hover:shadow-blue-200/70 dark:border-blue-900/60 dark:bg-slate-950/60 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <NotebookPen className="h-5 w-5" />
              Azioni rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-start gap-4 rounded-2xl border border-transparent bg-blue-50/40 p-4 transition hover:border-blue-200 hover:bg-blue-50 dark:bg-slate-900/60 dark:hover:border-blue-800/70 dark:hover:bg-slate-900"
              >
                <div className="rounded-xl bg-linear-to-br from-sky-400 via-blue-500 to-indigo-500 p-2 text-white shadow-md shadow-blue-500/40">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{action.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{action.description}</p>
                </div>
                <ArrowRight className="ml-auto mt-1 h-4 w-4 text-blue-500 transition group-hover:translate-x-1" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/50 backdrop-blur-sm transition hover:shadow-xl hover:shadow-blue-200/70 dark:border-blue-900/60 dark:bg-slate-950/60 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <History className="h-5 w-5" />
              Attività recenti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl border border-blue-100/60 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-slate-900/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">Intervento laparoscopico registrato</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aggiornato 2 ore fa</p>
            </div>
            <div className="rounded-2xl border border-blue-100/60 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-slate-900/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">Nuova nota su patologia epatobiliare</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aggiornata 1 giorno fa</p>
            </div>
            <div className="rounded-2xl border border-blue-100/60 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-slate-900/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">Follow-up paziente #A219 programmato</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aggiornato 3 giorni fa</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/50 backdrop-blur-sm transition hover:shadow-xl hover:shadow-blue-200/70 dark:border-blue-900/60 dark:bg-slate-950/60 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <Calendar className="h-5 w-5" />
              Prossimi appuntamenti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcoming.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-blue-100/60 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-slate-900/60"
              >
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.patient}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{item.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

