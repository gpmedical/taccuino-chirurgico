import Link from "next/link"
import { ArrowRight, FilePlus2, Layers3 } from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const templates = [
  {
    title: "Scheda intervento standard",
    description: "Struttura di base per registrare tempi operatori, equipe e note post-operatorie.",
  },
  {
    title: "Checklist laparoscopia",
    description: "Template focalizzato su strumenti utilizzati, complicanze e follow-up dedicato.",
  },
]

const recentInterventions = [
  {
    name: "Colecistectomia laparoscopica",
    date: "12 aprile 2024",
    status: "In follow-up",
  },
  {
    name: "Resezione intestinale",
    date: "8 aprile 2024",
    status: "Concluso",
  },
  {
    name: "Ernioplastica inguinale",
    date: "4 aprile 2024",
    status: "In revisione",
  },
]

export default function InterventiChirurgiciPage() {
  return (
    <DashboardSection
      title="Interventi chirurgici"
      description="Documenta con precisione ogni fase dell'atto chirurgico: preparazione, esecuzione, team coinvolto e follow-up."
      actions={
        <Button asChild className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700">
          <Link href="/dashboard/interventi-chirurgici/nuovo" className="flex items-center gap-2">
            Nuovo intervento
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <FilePlus2 className="h-5 w-5" />
              Ultimi interventi
            </CardTitle>
            <CardDescription>Rimani aggiornato sulle ultime procedure annotate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInterventions.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 transition hover:border-blue-200 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-slate-900/60 dark:hover:border-blue-800/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Registrato il {item.date}</p>
                  </div>
                  <span className="rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-blue-500/30">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <Layers3 className="h-5 w-5" />
              Template consigliati
            </CardTitle>
            <CardDescription>Avvia rapidamente una nuova scheda di intervento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <div key={template.title} className="space-y-2 rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{template.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{template.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardSection>
  )
}
