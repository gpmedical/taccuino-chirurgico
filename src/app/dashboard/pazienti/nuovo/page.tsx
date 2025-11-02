"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, Loader, NotebookPen } from "lucide-react"

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
import { useAuth } from "@/contexts/auth-context"
import { createPatient } from "@/lib/patients"

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

export default function NuovoPazientePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (values: PatientFormValues) => {
    if (!user) {
      toast.error("Devi essere autenticato per creare un paziente")
      return
    }

    setIsSubmitting(true)

    try {
      const toNullable = (value: string) => {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : null
      }

      const patientId = await createPatient(user.uid, {
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

      toast.success("Nuovo paziente creato con successo")
      router.push(`/dashboard/pazienti/${patientId}`)
    } catch (error) {
      console.error("Errore durante la creazione del paziente:", error)
      toast.error("Non e' stato possibile creare il paziente. Riprova piu' tardi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardSection
      title="Nuovo paziente"
      description="Registra un nuovo paziente, annota diagnosi e intervento e monitora i follow-up."
      actions={
        <Button
          asChild
          variant="outline"
          className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
        >
          <Link href="/dashboard/pazienti" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Torna ai pazienti
          </Link>
        </Button>
      }
    >
      <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-100">
            <NotebookPen className="h-5 w-5" />
            Dati anagrafici e clinici
          </CardTitle>
          <CardDescription>
            Inserisci le informazioni principali sul paziente, annota diagnosi e intervento e monitora i follow-up.
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
                      <FormLabel>Nome paziente</FormLabel>
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
                          placeholder="Es. Istologico defimitivo, consulto multidisciplinare, rivalutazione TC..."
                          className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
                  {isSubmitting ? "Salvataggio in corso..." : "Crea paziente"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardSection>
  )
}















