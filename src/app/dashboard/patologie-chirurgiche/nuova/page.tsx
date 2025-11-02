"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, NotebookPen } from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { createPathology } from "@/lib/surgical-pathologies"

const longTextSchema = z.string().max(4000, "Il testo inserito è troppo lungo").trim()

const formSchema = z.object({
  patologia: z
    .string()
    .min(3, "Inserisci almeno 3 caratteri")
    .max(120, "Massimo 120 caratteri")
    .transform((value) => value.trim()),
  titoloNota: z.string().max(160, "Massimo 160 caratteri").optional(),
  contenutoNota: longTextSchema,
})

type PathologyFormValues = z.infer<typeof formSchema>

const defaultValues: PathologyFormValues = {
  patologia: "",
  titoloNota: "",
  contenutoNota: "",
}

export default function NuovaPatologiaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PathologyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = async (values: PathologyFormValues) => {
    if (!user) {
      toast.error("Devi essere autenticato per creare una patologia")
      return
    }

    setIsSubmitting(true)
    const hasNote = Boolean(values.titoloNota?.trim() || values.contenutoNota?.trim())

    try {
      const pathologyId = await createPathology(
        user.uid,
        { patologia: values.patologia },
        hasNote
          ? {
              titolo: values.titoloNota?.trim() ?? "",
              contenuto: values.contenutoNota?.trim() ?? "",
            }
          : null
      )

      toast.success("Nuova patologia creata con successo")
      router.push(`/dashboard/patologie-chirurgiche/${pathologyId}`)
    } catch (error) {
      console.error("Errore durante la creazione della patologia:", error)
      toast.error("Non è stato possibile creare la patologia. Riprova più tardi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardSection
      title="Nuova patologia"
      description="Crea una scheda patologia con note diagnostiche e terapeutiche."
      actions={
        <Button
          asChild
          variant="outline"
          className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
        >
          <Link href="/dashboard/patologie-chirurgiche" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Torna alle patologie
          </Link>
        </Button>
      }
    >
      <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-100">
            <NotebookPen className="h-5 w-5" />
            Dettagli patologia
          </CardTitle>
          <CardDescription>
            Inserisci il nome della patologia e, se vuoi, aggiungi subito la prima nota clinica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="patologia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patologia</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Es. Neoplasia del colon"
                        className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card className="border-blue-100/70 bg-blue-50/40 shadow-sm shadow-blue-100/50 dark:border-blue-900/60 dark:bg-slate-900/60 dark:shadow-blue-950/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-blue-700 dark:text-blue-200">
                    Prima nota clinica (facoltativa)
                  </CardTitle>
                  <CardDescription>
                    Aggiungi una nota diagnostica o terapeutica.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titoloNota"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titolo nota</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Es. Inquadramento diagnostico"
                            className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contenutoNota"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenuto</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Schema terapeutico, preferenze chirurgiche, follow-up..."
                            className="min-h-32 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
                >
                  <Link href="/dashboard/patologie-chirurgiche">Annulla</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? "Salvataggio in corso..." : "Crea patologia"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardSection>
  )
}
