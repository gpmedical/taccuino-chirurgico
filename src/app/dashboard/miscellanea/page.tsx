import { Archive, BookmarkCheck, Lightbulb, Link2 } from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const resources = [
  {
    title: "Note veloci",
    description: "Appunti rapidi su procedure, comunicazioni e casi interessanti.",
    icon: Lightbulb,
  },
  {
    title: "Link utili",
    description: "Collegamenti a risorse esterne, linee guida e bibliografia.",
    icon: Link2,
  },
  {
    title: "Materiale formativo",
    description: "Registrazioni di webinar, slide e documenti per il team.",
    icon: Archive,
  },
]

const bookmarks = [
  "Checklist pre-operatoria aggiornamento 2024",
  "Video: anastomosi intracorporea",
  "FAQ gestione accessi ambulatoriali",
]

export default function MiscellaneaPage() {
  return (
    <DashboardSection
      title="Miscellanea"
      description="Uno spazio flessibile per raccogliere appunti, riferimenti e contenuti trasversali al tuo lavoro clinico."
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <BookmarkCheck className="h-5 w-5" />
              Sezioni rapide
            </CardTitle>
            <CardDescription>Organizza materiali eterogenei mantenendoli a portata di mano.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.title} className="flex items-start gap-4 rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <div className="rounded-xl bg-linear-to-br from-sky-400 via-blue-500 to-indigo-500 p-2 text-white shadow-sm shadow-blue-500/30">
                  <resource.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{resource.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{resource.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-200">Preferiti</CardTitle>
            <CardDescription>Elementi contrassegnati per accesso immediato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookmarks.map((item) => (
              <div key={item} className="space-y-2">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item}</p>
                <Separator className="bg-blue-200/70 dark:bg-blue-900/60" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardSection>
  )
}
