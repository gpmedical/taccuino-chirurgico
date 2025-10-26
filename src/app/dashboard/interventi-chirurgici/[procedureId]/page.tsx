"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore"
import {
  ArrowLeft,
  ClipboardList,
  Edit2,
  Layers3,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"

import { DashboardSection } from "@/components/dashboard/section-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import {
  createTechnique,
  deleteTechnique,
  updateTechnique,
} from "@/lib/surgical-procedures"
import type { SurgicalProcedure, SurgicalTechnique } from "@/types/interventi"

const longTextSchema = z
  .string()
  .max(4000, "Il testo inserito è troppo lungo")
  .optional()
  .transform((value) => value?.trim() ?? "")

const techniqueSchema = z.object({
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

type TechniqueFormValues = z.infer<typeof techniqueSchema>

const techniqueDefaultValues: TechniqueFormValues = {
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

const mapTechniqueToFormValues = (
  technique: SurgicalTechnique
): TechniqueFormValues => ({
  tecnica: technique.tecnica ?? "",
  preOperatorio: technique.preOperatorio ?? "",
  posizione: technique.posizione ?? "",
  accesso: technique.accesso ?? "",
  stepChirurgici: technique.stepChirurgici ?? "",
  tipsAndTricks: technique.tipsAndTricks ?? "",
  attenzioni: technique.attenzioni ?? "",
  postOperatorio: technique.postOperatorio ?? "",
  altro: technique.altro ?? "",
})

const formatDateTime = (timestamp?: { toDate?: () => Date }) => {
  if (!timestamp?.toDate) return "—"
  try {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp.toDate())
  } catch (error) {
    console.error("Errore nel formattare la data della tecnica:", error)
    return "—"
  }
}

const InfoBlock = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded-2xl border border-blue-100/70 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-slate-900/60">
    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">{label}</p>
    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-100">
      {value && value.length > 0 ? value : "—"}
    </p>
  </div>
)

interface PageProps {
  params: { procedureId: string }
}

export default function ProcedureDetailPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [procedure, setProcedure] = useState<SurgicalProcedure | null>(null)
  const [techniques, setTechniques] = useState<SurgicalTechnique[]>([])
  const [procedureError, setProcedureError] = useState<string | null>(null)
  const [techniquesError, setTechniquesError] = useState<string | null>(null)
  const [procedureLoading, setProcedureLoading] = useState(true)
  const [techniquesLoading, setTechniquesLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingTechnique, setEditingTechnique] = useState<SurgicalTechnique | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [techniqueToDelete, setTechniqueToDelete] = useState<SurgicalTechnique | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<TechniqueFormValues>({
    resolver: zodResolver(techniqueSchema),
    defaultValues: techniqueDefaultValues,
  })

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setProcedure(null)
      setProcedureError("Devi essere autenticato per visualizzare questa procedura.")
      setProcedureLoading(false)
      return
    }

    setProcedureLoading(true)
    const procedureRef = doc(db, "surgicalProcedures", params.procedureId)

    const unsubscribe = onSnapshot(
      procedureRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setProcedure(null)
          setProcedureError("L'intervento richiesto non esiste o è stato rimosso.")
        } else {
          const data = snapshot.data()
          if (data.userId !== user.uid) {
            setProcedure(null)
            setProcedureError("Non hai i permessi per visualizzare questa procedura.")
          } else {
            setProcedure({ id: snapshot.id, ...data } as SurgicalProcedure)
            setProcedureError(null)
          }
        }
        setProcedureLoading(false)
      },
      (error) => {
        console.error("Errore nel recupero della procedura:", error)
        setProcedure(null)
        setProcedureError("Impossibile caricare l'intervento al momento.")
        setProcedureLoading(false)
      }
    )

    return () => unsubscribe()
  }, [authLoading, params.procedureId, user])

  useEffect(() => {
    if (!procedure || !user || procedure.userId !== user.uid) {
      setTechniques([])
      setTechniquesError(null)
      setTechniquesLoading(false)
      return
    }

    setTechniquesLoading(true)
    const techniquesRef = collection(
      doc(db, "surgicalProcedures", procedure.id),
      "techniques"
    )
    const techniquesQuery = query(techniquesRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      techniquesQuery,
      (snapshot) => {
        const docs: SurgicalTechnique[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          proceduraId: procedure.id,
          ...doc.data(),
        })) as SurgicalTechnique[]
        setTechniques(docs)
        setTechniquesError(null)
        setTechniquesLoading(false)
      },
      (error) => {
        console.error("Errore nel recupero delle tecniche:", error)
        setTechniques([])
        setTechniquesError("Impossibile caricare le tecniche in questo momento.")
        setTechniquesLoading(false)
      }
    )

    return () => unsubscribe()
  }, [procedure, user])

  useEffect(() => {
    if (!dialogOpen) {
      setEditingTechnique(null)
      form.reset(techniqueDefaultValues)
      return
    }

    if (dialogMode === "edit" && editingTechnique) {
      form.reset(mapTechniqueToFormValues(editingTechnique))
    } else {
      form.reset(techniqueDefaultValues)
    }
  }, [dialogMode, dialogOpen, editingTechnique, form])

  const handleCreateClick = useCallback(() => {
    setDialogMode("create")
    setDialogOpen(true)
  }, [])

  const handleEditClick = useCallback((technique: SurgicalTechnique) => {
    setEditingTechnique(technique)
    setDialogMode("edit")
    setDialogOpen(true)
  }, [])

  const handleSubmitTechnique = async (values: TechniqueFormValues) => {
    if (!procedure) return

    setIsSubmitting(true)
    try {
      if (dialogMode === "create") {
        await createTechnique(procedure.id, values)
        toast.success("Nuova tecnica aggiunta")
      } else if (editingTechnique) {
        await updateTechnique(procedure.id, editingTechnique.id, values)
        toast.success("Tecnica aggiornata")
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Errore nel salvataggio della tecnica:", error)
      toast.error("Non è stato possibile salvare la tecnica. Riprova più tardi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTechnique = async () => {
    if (!procedure || !techniqueToDelete) return
    setIsDeleting(true)
    try {
      await deleteTechnique(procedure.id, techniqueToDelete.id)
      toast.success("Tecnica eliminata")
      setTechniqueToDelete(null)
    } catch (error) {
      console.error("Errore durante l'eliminazione della tecnica:", error)
      toast.error("Impossibile eliminare la tecnica. Riprova più tardi.")
    } finally {
      setIsDeleting(false)
    }
  }

  const techniquesCount = useMemo(() => techniques.length, [techniques])

  return (
    <DashboardSection
      title={procedure?.procedura ?? "Intervento chirurgico"}
      description={
        procedure
          ? "Consulta tutte le tecniche salvate per questa procedura, modifica le note esistenti o aggiungi nuove varianti operative."
          : ""
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
          >
            <Link href="/dashboard/interventi-chirurgici" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Indice interventi
            </Link>
          </Button>
          <Button
            onClick={handleCreateClick}
            disabled={!procedure || !!procedureError}
            className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-80"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuova tecnica
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {procedureLoading ? (
          <Card className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40">
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-2/3 rounded-full" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-5/6 rounded-full" />
            </CardContent>
          </Card>
        ) : null}

        {!procedureLoading && procedureError ? (
          <Card className="border-rose-200/70 bg-rose-50/70 shadow-sm shadow-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/70 dark:shadow-rose-950/40">
            <CardHeader>
              <CardTitle className="text-rose-700 dark:text-rose-200">Impossibile visualizzare l'intervento</CardTitle>
              <CardDescription>{procedureError}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/dashboard/interventi-chirurgici")}
                className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700"
              >
                Torna all'elenco
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!procedureLoading && !procedureError && procedure ? (
          <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/60 dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Layers3 className="h-5 w-5" />
                {procedure.procedura}
              </CardTitle>
              <CardDescription>
                Ultimo aggiornamento: {formatDateTime(procedure.updatedAt ?? procedure.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Badge className="bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/40">
                {techniquesCount} {techniquesCount === 1 ? "tecnica" : "tecniche"}
              </Badge>
            </CardContent>
          </Card>
        ) : null}

        {!procedureLoading && !procedureError && procedure ? (
          <div className="space-y-4">
            {techniquesLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Card
                    key={index}
                    className="border-blue-200/70 bg-white/80 shadow-sm shadow-blue-100/60 dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40"
                  >
                    <CardHeader className="space-y-3">
                      <Skeleton className="h-6 w-1/2 rounded-full" />
                      <Skeleton className="h-4 w-2/3 rounded-full" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full rounded-full" />
                      <Skeleton className="h-4 w-5/6 rounded-full" />
                      <Skeleton className="h-4 w-4/6 rounded-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {!techniquesLoading && techniquesError ? (
              <Card className="border-amber-200/70 bg-amber-50/70 shadow-sm shadow-amber-100/60 dark:border-amber-900/60 dark:bg-amber-950/70 dark:shadow-amber-950/40">
                <CardHeader>
                  <CardTitle className="text-amber-700 dark:text-amber-200">Problema nel caricare le tecniche</CardTitle>
                  <CardDescription>{techniquesError}</CardDescription>
                </CardHeader>
              </Card>
            ) : null}

            {!techniquesLoading && !techniquesError && techniques.length === 0 ? (
              <Card className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/60 dark:border-blue-900/60 dark:bg-slate-950/80 dark:shadow-blue-950/40">
                <CardHeader className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/40">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-blue-800 dark:text-blue-200">Nessuna tecnica registrata</CardTitle>
                  <CardDescription>
                    Aggiungi la prima variante di tecnica per questa procedura e mantieni aggiornato il tuo taccuino.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button
                    onClick={handleCreateClick}
                    className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuova tecnica
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {!techniquesLoading && !techniquesError && techniques.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {techniques.map((technique) => (
                  <Card
                    key={technique.id}
                    className="border-blue-200/70 bg-white/80 shadow-md shadow-blue-100/60 transition hover:border-blue-300 hover:shadow-lg hover:shadow-blue-200/60 dark:border-blue-900/60 dark:bg-slate-950/80 dark:hover:border-blue-700 dark:hover:shadow-blue-900/60"
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                            <ClipboardList className="h-5 w-5" />
                            {technique.tecnica}
                          </CardTitle>
                          <CardDescription>
                            Aggiornata: {formatDateTime(technique.updatedAt ?? technique.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-start">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-slate-900"
                            onClick={() => handleEditClick(technique)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Modifica tecnica</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-300 dark:hover:bg-slate-900"
                            onClick={() => setTechniqueToDelete(technique)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Elimina tecnica</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoBlock label="Pre-Operatorio" value={technique.preOperatorio} />
                        <InfoBlock label="Posizione" value={technique.posizione} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoBlock label="Accesso" value={technique.accesso} />
                        <InfoBlock label="Step Chirurgici" value={technique.stepChirurgici} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoBlock label="Tips and Tricks" value={technique.tipsAndTricks} />
                        <InfoBlock label="Fare attenzione a" value={technique.attenzioni} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <InfoBlock label="Post-Operatorio" value={technique.postOperatorio} />
                        <InfoBlock label="Altro" value={technique.altro} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-blue-200/70 bg-white/95 shadow-2xl shadow-blue-200/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/95 dark:shadow-blue-950/60">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Nuova tecnica" : "Modifica tecnica"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Aggiungi una nuova variante tecnica a questa procedura. Il campo Procedura non è modificabile."
                : "Aggiorna i dettagli della tecnica selezionata."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitTechnique)} className="space-y-4">
              <FormItem>
                <FormLabel>Procedura</FormLabel>
                <FormControl>
                  <Input
                    value={procedure?.procedura ?? ""}
                    disabled
                    className="border-blue-200/70 bg-slate-100/60 text-slate-500 dark:border-blue-900/60 dark:bg-slate-900/60 dark:text-slate-300"
                  />
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="tecnica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tecnica</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Es. Approccio open"
                        className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preOperatorio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-Operatorio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Checklist pre-operatoria, materiali, preparazione"
                          className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
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
                          placeholder="Posizionamento del paziente e dell'equipe"
                          className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
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
                  name="accesso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accesso</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descrivi accessi, incisioni, porte"
                          className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
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
                          placeholder="Sequenza degli step principali"
                          className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
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
                  name="tipsAndTricks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tips and Tricks</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Accorgimenti personali, strumenti, suggerimenti"
                          className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
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
                          placeholder="Punti critici e strutture da preservare"
                          className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
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
                  name="postOperatorio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post-Operatorio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Monitoraggi, terapia, follow-up"
                          className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
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
                          placeholder="Note aggiuntive, riferimenti, materiali"
                          className="min-h-24 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
                  >
                    Annulla
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? "Salvataggio..." : dialogMode === "create" ? "Aggiungi tecnica" : "Salva modifiche"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!techniqueToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setTechniqueToDelete(null)
          }
        }}
      >
        <AlertDialogContent className="border-rose-200/70 bg-white/95 shadow-xl shadow-rose-200/60 backdrop-blur dark:border-rose-900/60 dark:bg-rose-950/95 dark:shadow-rose-950/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina tecnica</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare definitivamente questa tecnica? L'operazione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTechnique}
              disabled={isDeleting}
              className="bg-linear-to-r from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-500/40 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isDeleting ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardSection>
  )
}
