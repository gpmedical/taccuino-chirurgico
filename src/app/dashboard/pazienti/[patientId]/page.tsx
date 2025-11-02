"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { doc, onSnapshot } from "firebase/firestore"
import type { Timestamp } from "firebase/firestore"
import {
  CalendarClock,
  ClipboardList,
  Loader,
  NotebookPen,
  Trash2,
  UserRound,
} from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { deletePatient, updatePatient } from "@/lib/patients"
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
      console.error("Errore nel convertire il timestamp del paziente:", error)
      return null
    }
  }

  return null
}

const nameSchema = z
  .string()
  .trim()
  .min(2, "Inserisci almeno 2 caratteri")
  .max(120, "Massimo 120 caratteri")

const diagnosisSchema = z.string().trim().max(200, "Massimo 200 caratteri")

const interventionSchema = z.string().trim().max(160, "Massimo 160 caratteri")

const mediumTextSchema = z.string().trim().max(400, "Massimo 400 caratteri")

const longTextSchema = z.string().trim().max(4000, "Il testo inserito e' troppo lungo")

const dateSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || !Number.isNaN(new Date(value).getTime()),
    { message: "Inserisci una data valida" }
  )

const pendingReasonSchema = z.string().trim().max(200, "Massimo 200 caratteri")

const formSchema = z
  .object({
    nome: nameSchema,
    diagnosi: diagnosisSchema,
    intervento: interventionSchema,
    dataIntervento: dateSchema,
    operatori: mediumTextSchema,
    apr: longTextSchema,
    app: longTextSchema,
    note: longTextSchema,
    inSospeso: z.boolean(),
    dataFollowUp: dateSchema,
    pendingReason: pendingReasonSchema,
  })
  .superRefine((data, ctx) => {
    if (data.inSospeso && data.pendingReason.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pendingReason"],
        message: "Specifica cosa e' in sospeso",
      })
    }

    if (!data.inSospeso && data.pendingReason.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pendingReason"],
        message: 'Disattiva "In sospeso" oppure rimuovi il testo',
      })
    }
  })

type PatientFormValues = z.infer<typeof formSchema>

const defaultValues: PatientFormValues = {
  nome: "",
  diagnosi: "",
  intervento: "",
  dataIntervento: "",
  operatori: "",
  apr: "",
  app: "",
  note: "",
  inSospeso: false,
  dataFollowUp: "",
  pendingReason: "",
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
    console.error("Errore nel formattare la data del paziente:", error)
    return "di recente"
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return "Non specificata"

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

const mapPatientToFormValues = (patient: Patient): PatientFormValues => ({
  nome: patient.nome ?? "",
  diagnosi: patient.diagnosi ?? "",
  intervento: patient.intervento ?? "",
  dataIntervento: patient.dataIntervento ?? "",
  operatori: patient.operatori ?? "",
  apr: patient.apr ?? "",
  app: patient.app ?? "",
  note: patient.note ?? "",
  inSospeso: Boolean(patient.inSospeso),
  dataFollowUp: patient.dataFollowUp ?? "",
  pendingReason: patient.pendingReason ?? "",
})

export default function PazienteDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams<{ patientId: string }>()
  const patientId = params?.patientId

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const isPending = form.watch("inSospeso")

  useEffect(() => {
    if (!isPending) {
      form.setValue("pendingReason", "", { shouldValidate: false, shouldDirty: false })
      form.clearErrors("pendingReason")
    }
  }, [isPending, form])

  useEffect(() => {
    if (!patientId) {
      setPatient(null)
      setError("Il paziente non e' stato trovato.")
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
          setError("Il paziente non e' stato trovato.")
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
        form.reset(mapPatientToFormValues(patientData))
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
  }, [patientId, user?.uid, form])

  const lastUpdateLabel = useMemo(() => {
    if (!patient) return null
    return formatTimestamp(patient.updatedAt ?? patient.createdAt)
  }, [patient])

  const handleSubmit = async (values: PatientFormValues) => {
    if (!patientId) return

    setIsSubmitting(true)
    try {
      const toNullable = (value: string) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : null
      }

      await updatePatient(patientId, {
        nome: values.nome.trim(),
        diagnosi: toNullable(values.diagnosi),
        intervento: toNullable(values.intervento),
        dataIntervento: toNullable(values.dataIntervento),
        operatori: toNullable(values.operatori),
        apr: toNullable(values.apr),
        app: toNullable(values.app),
        note: toNullable(values.note),
        inSospeso: values.inSospeso,
        dataFollowUp: toNullable(values.dataFollowUp),
        pendingReason: values.inSospeso ? toNullable(values.pendingReason) : null,
      })
      toast.success("Dati paziente aggiornati")
    } catch (error) {
      console.error("Errore durante l'aggiornamento del paziente:", error)
      toast.error("Non e' stato possibile aggiornare il paziente. Riprova piu' tardi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!patientId) return

    setIsDeleting(true)
    try {
      await deletePatient(patientId)
      toast.success("Paziente eliminato")
      router.push("/dashboard/pazienti")
    } catch (error) {
      console.error("Errore durante l'eliminazione del paziente:", error)
      toast.error("Non e' stato possibile eliminare il paziente. Riprova piu' tardi.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardSection
      title={patient ? patient.nome || "Paziente" : "Dettagli paziente"}
      description="Aggiorna le informazioni cliniche, monitora il follow-up e coordina il team di cura."
      actions={
        <Button
          asChild
          variant="outline"
          className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
        >
          <Link href="/dashboard/pazienti" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            Torna ai pazienti
          </Link>
        </Button>
      }
    >
      {loading ? (
        <div className="grid gap-6">
          <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-1/3 rounded-full" />
              <Skeleton className="h-4 w-1/4 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {!loading && error ? (
        <Card className="border-rose-200/70 bg-rose-50/70 shadow-sm shadow-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/70 dark:shadow-rose-950/40">
          <CardHeader>
            <CardTitle className="text-rose-700 dark:text-rose-200">Si Ã¨ verificato un errore</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!loading && !error && patient ? (
        <div className="grid gap-6">
          <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center justify-between text-blue-800 dark:text-blue-200">
                <span className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" />
                  {patient.nome || "Paziente senza nome"}
                </span>
                <Badge
                  variant={patient.inSospeso ? "secondary" : "outline"}
                  className={patient.inSospeso ? "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200" : "border-blue-200/70 text-blue-700 dark:border-blue-900/60 dark:text-blue-200"}
                >
                  {patient.inSospeso ? "Follow-up in sospeso" : "Programma completato"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
                Ultimo aggiornamento: {lastUpdateLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">Diagnosi:</span>{" "}
                  {patient.diagnosi ?? "-"}
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-500" />
                  <span>
                    Intervento:
                    <span className="ml-1 font-medium text-slate-900 dark:text-slate-100">
                      {patient.intervento ?? "-"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-blue-500" />
                  <span>Data intervento: {formatDate(patient.dataIntervento)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-indigo-500" />
                  <span>Follow-up: {formatDate(patient.dataFollowUp)}</span>
                </div>
                {patient.inSospeso && patient.pendingReason ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 text-amber-500" />
                    <span>In sospeso: {patient.pendingReason}</span>
                  </div>
                ) : null}
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">Operatori:</span>{" "}
                  {patient.operatori ?? "-"}
                </div>
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">APR:</span>{" "}
                  {patient.apr ?? "-"}
                </div>
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">APP:</span>{" "}
                  {patient.app ?? "-"}
                </div>
              </div>
              {patient.note ? (
                <div className="md:col-span-2">
                  <div className="rounded-xl border border-blue-100/70 bg-blue-50/40 p-4 text-sm text-slate-600 dark:border-blue-900/60 dark:bg-slate-900/60 dark:text-slate-300">
                    <p className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-200">
                      <NotebookPen className="h-4 w-4" />
                      Note cliniche
                    </p>
                    <p className="mt-2 leading-relaxed">{patient.note}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-100">
                <NotebookPen className="h-5 w-5" />
                Aggiorna dati paziente
              </CardTitle>
              <CardDescription>
                Modifica le informazioni cliniche e tieni traccia dei prossimi passi di gestione.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome e cognome</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Es. Mario Rossi"
                              className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dataIntervento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data intervento</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="diagnosi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosi</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Es. Adenocarcinoma del colon ascendente"
                              className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="intervento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intervento chirurgico</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Es. Emicolectomia destra laparoscopica"
                              className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="operatori"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operatori</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Equipe chirurgica"
                          className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataFollowUp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data follow-up</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="apr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>APR</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Anamnesi patologica remota, comorbidità, terapie croniche..."
                              className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="app"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>APP</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Anamnesi patologica prossima, sintomi attuali"
                              className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note aggiuntive</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Annotazioni aggiuntive, criticità, ecc."
                            className="min-h-32 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inSospeso"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
                        <div className="space-y-1">
                          <FormLabel className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
                            <Loader className="h-4 w-4" />
                            In sospeso
                          </FormLabel>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Istologici in sospeso, TC di controllo o altro follow-up.
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                  </FormItem>
                )}
              />

              {isPending ? (
                <FormField
                  control={form.control}
                  name="pendingReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dettagli</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Es. Istologico definitivo, consulto multidisciplinare, rivalutazione TC..."
                          className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          className="flex items-center gap-2"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          Elimina paziente
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white/95 backdrop-blur dark:bg-slate-950/95">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminare questo paziente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            L'operazione non può essere annullata e rimuoverà definitivamente tutte le informazioni registrate.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-200 dark:bg-rose-500 dark:hover:bg-rose-400"
                            onClick={handleDelete}
                            disabled={isDeleting}
                          >
                            Conferma
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
                      >
                        <Link href="/dashboard/pazienti">Annulla</Link>
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-80"
                      >
                        {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardSection>
  )
}

















