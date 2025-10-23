"use client"

import type { SVGProps } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  NotebookPen,
  Stethoscope,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

const quickActions = [
  {
    title: "Registra un intervento",
    description: "Annota dettagli tecnici, complicanze e note operative in tempo reale.",
    href: "/dashboard/interventi-chirurgici",
  icon: ScalpelIcon,
  },
  {
    title: "Aggiorna una patologia",
    description: "Confronta linee guida, protocolli interni e appunti personali.",
    href: "/dashboard/patologie-chirurgiche",
    icon: Stethoscope,
  },
  {
    title: "Carica un caso clinico",
    description: "Documenta percorsi terapeutici, imaging e follow-up multidisciplinari.",
    href: "/dashboard/casi-clinici",
    icon: NotebookPen,
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

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/80 p-6 shadow-lg shadow-blue-100/60 backdrop-blur-sm dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40 sm:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.25),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_55%)]" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
              Benvenuto {user?.displayName ? `, ${user.displayName}` : ""}
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
              Organizza la tua attività chirurgica con un solo sguardo
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Monitora interventi, patologie, casi clinici e follow-up dei pazienti in un ambiente sicuro e sincronizzato.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700">
                <Link href="/dashboard/interventi-chirurgici" className="flex items-center gap-2">
                  Nuovo intervento
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-blue-300/80 text-blue-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/70 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900">
                <Link href="/dashboard/follow-up-pazienti">Gestisci follow-up</Link>
              </Button>
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-4 rounded-2xl border border-blue-200/60 bg-white/70 p-4 shadow-md shadow-blue-200/50 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/40">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Interventi registrati</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">24</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/40">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Patologie aggiornate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/40">
                <CalendarCheck2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Follow-up imminenti</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">5</p>
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
                <div className="rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 p-2 text-white shadow-md shadow-blue-500/40">
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
              <ClipboardList className="h-5 w-5" />
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
              <CalendarCheck2 className="h-5 w-5" />
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

function ScalpelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"h-5 w-5"}
    >
      <path d="M3 17l6-6 4 4-6 6H3z" />
      <path d="M14 7l7-7" />
    </svg>
  )
}
