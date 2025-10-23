import Link from "next/link"
import { ArrowRight, FolderKanban, NotebookPen, Users } from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const cases = [
  {
    title: "Caso multidisciplinare colon-retto",
    summary: "Follow-up di 18 mesi con outcome funzionali e qualità di vita.",
    status: "In discussione MDT",
  },
  {
    title: "Gestione complicanza post-pancreasectomia",
    summary: "Approccio combinato radiologico e endoscopico.",
    status: "Documentazione in corso",
  },
]

const collaborators = [
  {
    name: "Team Oncologia",
    role: "Ha aggiunto note e immagini",
  },
  {
    name: "Radiologia",
    role: "Referto TC allegato",
  },
  {
    name: "Fisioterapia",
    role: "Piano riabilitativo aggiornato",
  },
]

export default function CasiCliniciPage() {
  return (
    <DashboardSection
      title="Casi clinici"
      description="Raccogli dettagli clinici, immagini diagnostiche e percorsi terapeutici condivisi con il team multidisciplinare."
      actions={
        <Button asChild className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700">
          <Link href="/dashboard/casi-clinici/nuovo" className="flex items-center gap-2">
            Nuovo caso clinico
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <NotebookPen className="h-5 w-5" />
              Archivio casi
            </CardTitle>
            <CardDescription>Ultimi casi clinici registrati e pronti per la revisione.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cases.map((item) => (
              <div key={item.title} className="space-y-3 rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                  <span className="rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-blue-500/30">
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.summary}</p>
              </div>
            ))}
            <Button variant="outline" asChild className="w-full border-blue-300/80 text-blue-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/70 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900">
              <Link href="/dashboard/casi-clinici">Vedi tutti i casi</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <Users className="h-5 w-5" />
              Collaborazioni recenti
            </CardTitle>
            <CardDescription>Professionisti che hanno contribuito ai casi nelle ultime settimane.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {collaborators.map((item) => (
              <div key={item.name} className="flex items-start gap-4 rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <div className="rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 p-2 text-white shadow-sm shadow-blue-500/30">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.role}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardSection>
  )
}
