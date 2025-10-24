import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2, Clock4 } from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const upcomingVisits = [
  {
    patient: "Paziente #A219",
    date: "15 aprile 2024",
    type: "Follow-up chirurgia addominale",
    status: "Programmato",
  },
  {
    patient: "Paziente #C104",
    date: "18 aprile 2024",
    type: "Controllo post-operatorio",
    status: "Da confermare",
  },
]

const completed = [
  {
    patient: "Paziente #B502",
    date: "9 aprile 2024",
    type: "Follow-up oncologico",
  },
  {
    patient: "Paziente #D330",
    date: "6 aprile 2024",
    type: "Valutazione funzionale",
  },
]

export default function PazientiPage() {
  return (
    <DashboardSection
      title="Pazienti"
      description="Salva i tuoi pazienti da seguire per il follow-up."
      actions={
        <Button asChild className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700">
          <Link href="/dashboard/follow-up-pazienti/nuovo" className="flex items-center gap-2">
            Nuovo paziente
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <CalendarDays className="h-5 w-5" />
              Appuntamenti imminenti
            </CardTitle>
            <CardDescription>Prossimi controlli programmati con il tuo team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingVisits.map((visit) => (
              <div key={visit.patient} className="space-y-2 rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{visit.patient}</p>
                  <Badge className="bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/30">
                    {visit.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{visit.type}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{visit.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <CheckCircle2 className="h-5 w-5" />
              Follow-up completati
            </CardTitle>
            <CardDescription>Valutazioni recenti e outcome registrati.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completed.map((item) => (
              <div key={item.patient} className="flex items-start gap-4 rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <div className="rounded-xl bg-linear-to-br from-sky-400 via-blue-500 to-indigo-500 p-2 text-white shadow-sm shadow-blue-500/30">
                  <Clock4 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{item.patient}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.type}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Valutato il {item.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardSection>
  )
}
