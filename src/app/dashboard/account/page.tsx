import { ShieldCheck, User, UserCog } from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const preferences = [
  {
    label: "Notifiche email",
    description: "Ricevi aggiornamenti su follow-up, commenti e revisioni dei casi.",
    enabled: true,
  },
  {
    label: "Tema scuro automatico",
    description: "Adatta la visualizzazione in base al tuo dispositivo.",
    enabled: true,
  },
  {
    label: "Sincronizzazione dispositivi",
    description: "Mantieni le note aggiornate tra mobile e desktop.",
    enabled: false,
  },
]

const security = [
  {
    title: "Autenticazione a due fattori",
    status: "Consigliato",
  },
  {
    title: "Ultimo accesso",
    status: "13 aprile 2024, 21:14",
  },
]

export default function AccountPage() {
  return (
    <DashboardSection
      title="Account"
      description="Gestisci impostazioni personali, preferenze e sicurezza del tuo profilo professionale."
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <UserCog className="h-5 w-5" />
              Preferenze utente
            </CardTitle>
            <CardDescription>
              Configura l&apos;esperienza d&apos;uso secondo le tue necessità.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.map((item) => (
              <div key={item.label} className="space-y-2 rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                  <span className="rounded-full border border-blue-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-slate-950/70 dark:text-blue-200">
                    {item.enabled ? "Attivo" : "Disattivo"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <ShieldCheck className="h-5 w-5" />
              Sicurezza
            </CardTitle>
            <CardDescription>Controlla le informazioni sensibili del tuo account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {security.map((item) => (
              <div key={item.title} className="space-y-2">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{item.status}</p>
                <Separator className="bg-blue-200/70 dark:bg-blue-900/60" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
            <User className="h-5 w-5" />
            Dati profilo
          </CardTitle>
          <CardDescription>Riepilogo delle informazioni principali associate al tuo account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Nome completo</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nome e Cognome</p>
          </div>
          <div className="rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">nome@ospedale.it</p>
          </div>
          <div className="rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Struttura</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ospedale San Marco</p>
          </div>
          <div className="rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Ruolo</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Chirurgo generale</p>
          </div>
        </CardContent>
      </Card>
    </DashboardSection>
  )
}
