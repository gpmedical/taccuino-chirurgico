"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, ClipboardPlus } from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { createProcedureWithTechnique } from "@/lib/surgical-procedures"

const longTextSchema = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z
    .string()
    .max(4000, "Il testo inserito è troppo lungo")
    .transform((value) => value.trim())
)

const formSchema = z.object({
  procedura: z
    .string()
    .min(3, "Inserisci almeno 3 caratteri")
    .max(120, "Massimo 120 caratteri")
    .transform((value) => value.trim()),
  tecnica: z
    .string()
    .min(3, "Inserisci almeno 3 caratteri")
    .max(120, "Massimo 120 caratteri")
    .transform((value) => value.trim()),
  preOperatorio: longTextSchema,
  posizione: longTextSchema,
  accesso: longTextSchema,
  stepChirurgici: longTextSchema,
  tipsAndTricks: longTextSchema,
  attenzioni: longTextSchema,
  postOperatorio: longTextSchema,
  altro: longTextSchema,
})

type ProcedureFormValues = z.infer<typeof formSchema>

const defaultValues: ProcedureFormValues = {
  procedura: "",
  tecnica: "",
  preOperatorio: "",
  posizione: "",
  accesso: "",
  stepChirurgici: "",
  tipsAndTricks: "",
  attenzioni: "",
  postOperatorio: "",
  altro: "",
}

export default function NuovoInterventoPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProcedureFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = async (values: ProcedureFormValues) => {
    if (!user) {
      toast.error("Devi essere autenticato per creare un intervento")
      return
    }

    setIsSubmitting(true)
    try {
      const procedureId = await createProcedureWithTechnique(user.uid, values)
      toast.success("Nuovo intervento creato con successo")
      router.push(`/dashboard/interventi-chirurgici/${procedureId}`)
    } catch (error) {
      console.error("Errore durante la creazione dell'intervento:", error)
      toast.error("Non è stato possibile creare l'intervento. Riprova più tardi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardSection
      title="Nuovo intervento"
      description="Registra una nuova procedura chirurgica completa di tecnica, accorgimenti pre e post-operatori e note operative."
      actions={
        <Button
          asChild
          variant="outline"
          className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
        >
          <Link href="/dashboard/interventi-chirurgici" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Torna agli interventi
          </Link>
        </Button>
      }
    >
      <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-100">
            <ClipboardPlus className="h-5 w-5" />
            Dettagli intervento
          </CardTitle>
          <CardDescription>
            Compila le sezioni per creare la scheda completa della procedura e salvare la prima tecnica associata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="procedura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedura</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Es. Colecistectomia"
                          className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tecnica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tecnica</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Es. Laparoscopica a 4 trocars"
                          className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preOperatorio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-Operatorio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Checklist pre-operatoria, imaging, preparazione paziente"
                          className="min-h-28 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="posizione"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posizione</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descrivi la posizione del paziente e dell'equipe"
                          className="min-h-28 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="accesso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accesso</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Dettaglia i punti di accesso e le porte utilizzate"
                          className="min-h-28 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stepChirurgici"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Chirurgici</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Sequenza degli step fondamentali dell'intervento"
                          className="min-h-28 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tipsAndTricks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tips and Tricks</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Suggerimenti personali, strumenti preferiti, trucchi del mestiere"
                          className="min-h-28 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attenzioni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fare attenzione a</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Punti critici, strutture da preservare, possibili complicanze"
                          className="min-h-28 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="postOperatorio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post-Operatorio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Gestione post-operatoria, follow-up, terapia"
                          className="min-h-28 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="altro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altro</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Note aggiuntive, materiali, riferimenti bibliografici"
                          className="min-h-28 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
                >
                  <Link href="/dashboard/interventi-chirurgici">Annulla</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? "Salvataggio in corso..." : "Crea intervento"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardSection>
  )
}
