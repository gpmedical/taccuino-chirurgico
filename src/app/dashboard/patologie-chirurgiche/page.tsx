import Link from "next/link"
import { ArrowRight, BookOpenText, Microscope, Sparkles } from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const knowledgeBase = [
  {
    title: "Protocollo ERAS",
    description: "Sintesi delle raccomandazioni per la gestione pre e post-operatoria.",
  },
  {
    title: "Algoritmo tumori pancreatici",
    description: "Percorso diagnostico-terapeutico aggiornato alle ultime linee guida.",
  },
]

const updates = [
  {
    title: "Linee guida chirurgia epatobiliare",
    date: "Aggiornate 5 giorni fa",
  },
  {
    title: "Gestione complicanze post-bariatriche",
    date: "Aggiornato 1 settimana fa",
  },
  {
    title: "Patologie tiroidee rare",
    date: "Aggiornato 2 settimane fa",
  },
]

export default function PatologieChirurgichePage() {
  return (
    <DashboardSection
      title="Patologie chirurgiche"
      description="Centralizza conoscenze, linee guida e schede patologia per ottimizzare la decisione clinica."
      actions={
        <Button asChild variant="outline" className="border-blue-300/80 text-blue-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/70 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900">
          <Link href="/dashboard/patologie-chirurgiche/nuova" className="flex items-center gap-2">
            Nuova scheda patologia
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <Microscope className="h-5 w-5" />
              Aggiornamenti recenti
            </CardTitle>
            <CardDescription>Le ultime revisioni effettuate dal team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {updates.map((item) => (
              <div key={item.title} className="rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <BookOpenText className="h-5 w-5" />
              Banca del sapere
            </CardTitle>
            <CardDescription>Documenti e percorsi terapeutici più consultati.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {knowledgeBase.map((item) => (
              <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <div className="rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 p-2 text-white shadow-sm shadow-blue-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardSection>
  )
}
