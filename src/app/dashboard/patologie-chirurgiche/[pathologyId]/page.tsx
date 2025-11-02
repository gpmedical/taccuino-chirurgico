"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
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
import type { Timestamp } from "firebase/firestore"
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
import { DashboardSection } from "@/components/dashboard/section-shell"
import { PaginationControls } from "@/components/dashboard/pagination-controls"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import {
  createPathologyNote,
  deletePathology,
  deletePathologyNote,
  updatePathology,
  updatePathologyNote,
} from "@/lib/surgical-pathologies"
import type { SurgicalPathology, SurgicalPathologyNote } from "@/types/patologie"
import { ArrowLeft, FilePenLine, PlusCircle, Trash2 } from "lucide-react"
import { usePagination } from "@/hooks/use-pagination"

type TimestampLike = Timestamp | Date | { toDate?: () => Date } | null | undefined

const formatTimestamp = (timestamp?: TimestampLike) => {
  if (!timestamp) return "di recente"

  const date = (() => {
    if (timestamp instanceof Date) {
      return timestamp
    }

    const withToDate = timestamp as Timestamp | { toDate?: () => Date }

    if (typeof withToDate?.toDate === "function") {
      try {
        return withToDate.toDate()
      } catch (error) {
        console.error("Errore nel convertire il timestamp della nota:", error)
        return null
      }
    }

    return null
  })()

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
    console.error("Errore nel formattare la data:", error)
    return "di recente"
  }
}

const noteSchema = z.object({
  titolo: z
    .string()
    .min(3, "Inserisci almeno 3 caratteri")
    .max(160, "Massimo 160 caratteri")
    .trim(),
  contenuto: z
    .string()
    .min(3, "Inserisci almeno 3 caratteri")
    .max(4000, "Il testo inserito è troppo lungo")
    .trim(),
})

type NoteFormValues = z.infer<typeof noteSchema>

const noteDefaultValues: NoteFormValues = {
  titolo: "",
  contenuto: "",
}

export default function PatologiaDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams<{ pathologyId: string }>()
  const pathologyId = params?.pathologyId

  const [pathology, setPathology] = useState<SurgicalPathology | null>(null)
  const [pathologyLoading, setPathologyLoading] = useState(true)
  const [notes, setNotes] = useState<SurgicalPathologyNote[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeletingPathology, setIsDeletingPathology] = useState(false)

  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<SurgicalPathologyNote | null>(null)
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<SurgicalPathologyNote | null>(null)
  const [isDeletingNote, setIsDeletingNote] = useState(false)

  const [isEditTitleOpen, setIsEditTitleOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false)

  const noteForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: noteDefaultValues,
  })

  useEffect(() => {
    if (!user || !pathologyId) {
      setPathologyLoading(false)
      setNotesLoading(false)
      return
    }

    const pathologyRef = doc(db, "surgicalPathologies", pathologyId)
    const unsubscribePathology = onSnapshot(
      pathologyRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Patologia non trovata o non accessibile.")
          setPathology(null)
          setPathologyLoading(false)
          return
        }

        const data = snapshot.data() as Omit<SurgicalPathology, "id">
        setPathology({
          id: snapshot.id,
          patologia: data.patologia,
          userId: data.userId,
          notesCount: data.notesCount ?? 0,
          lastNote: data.lastNote ?? null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        })
        setError(null)
        setPathologyLoading(false)
      },
      (err) => {
        console.error("Errore nel recupero della patologia:", err)
        setError("Impossibile recuperare la patologia al momento.")
        setPathologyLoading(false)
      }
    )

    const notesRef = collection(pathologyRef, "notes")
    const notesQuery = query(notesRef, orderBy("updatedAt", "desc"))
    const unsubscribeNotes = onSnapshot(
      notesQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Omit<SurgicalPathologyNote, "id">
          return {
            id: docSnapshot.id,
            titolo: data.titolo,
            contenuto: data.contenuto,
            createdAt: data.createdAt ?? null,
            updatedAt: data.updatedAt ?? null,
          }
        })

        setNotes(docs)
        setNotesLoading(false)
      },
      (err) => {
        console.error("Errore nel recupero delle note:", err)
        setError("Impossibile recuperare le note della patologia.")
        setNotesLoading(false)
      }
    )

    return () => {
      unsubscribePathology()
      unsubscribeNotes()
    }
  }, [user, pathologyId])

  useEffect(() => {
    if (dialogMode === "create") {
      noteForm.reset(noteDefaultValues)
      setSelectedNote(null)
    }
  }, [dialogMode, noteForm])

  const handleCreateNote = () => {
    setDialogMode("create")
    setIsDialogOpen(true)
  }

  const handleEditNote = (note: SurgicalPathologyNote) => {
    setSelectedNote(note)
    noteForm.reset({
      titolo: note.titolo ?? "",
      contenuto: note.contenuto ?? "",
    })
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  const handleSubmitNote = async (values: NoteFormValues) => {
    if (!pathologyId) return

    setIsSubmittingNote(true)
    try {
      if (dialogMode === "create") {
        await createPathologyNote(pathologyId, values)
        toast.success("Nota creata con successo")
      } else if (selectedNote) {
        await updatePathologyNote(pathologyId, selectedNote.id, values)
        toast.success("Nota aggiornata con successo")
      }

      setIsDialogOpen(false)
      setSelectedNote(null)
      noteForm.reset(noteDefaultValues)
    } catch (error) {
      console.error("Errore durante il salvataggio della nota:", error)
      toast.error("Non è stato possibile salvare la nota. Riprova più tardi.")
    } finally {
      setIsSubmittingNote(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!pathologyId || !noteToDelete) return

    setIsDeletingNote(true)
    try {
      await deletePathologyNote(pathologyId, noteToDelete.id)
      toast.success("Nota eliminata con successo")
      setNoteToDelete(null)
    } catch (error) {
      console.error("Errore durante l'eliminazione della nota:", error)
      toast.error("Non è stato possibile eliminare la nota. Riprova più tardi.")
    } finally {
      setIsDeletingNote(false)
    }
  }

  const handleOpenTitleDialog = () => {
    if (!pathology) return
    setNewTitle(pathology.patologia ?? "")
    setIsEditTitleOpen(true)
  }

  const handleUpdateTitle = async () => {
    if (!pathologyId) return

    const trimmedTitle = newTitle.trim()
    if (trimmedTitle.length < 3) {
      toast.error("Inserisci almeno 3 caratteri per il nome della patologia")
      return
    }

    setIsUpdatingTitle(true)
    try {
      await updatePathology(pathologyId, { patologia: trimmedTitle })
      toast.success("Patologia aggiornata con successo")
      setIsEditTitleOpen(false)
    } catch (error) {
      console.error("Errore durante l'aggiornamento della patologia:", error)
      toast.error("Non è stato possibile aggiornare la patologia. Riprova più tardi.")
    } finally {
      setIsUpdatingTitle(false)
    }
  }

  const handleDeletePathology = async () => {
    if (!pathologyId) return

    setIsDeletingPathology(true)
    try {
      await deletePathology(pathologyId)
      toast.success("Patologia eliminata con successo")
      router.push("/dashboard/patologie-chirurgiche")
    } catch (error) {
      console.error("Errore durante l'eliminazione della patologia:", error)
      toast.error("Non è stato possibile eliminare la patologia. Riprova più tardi.")
    } finally {
      setIsDeletingPathology(false)
    }
  }

  const notesCount = useMemo(() => notes.length, [notes])
  const NOTES_PER_PAGE = 4

  const {
    currentPage: notePage,
    totalPages: totalNotePages,
    pageItems: visibleNotes,
    goToPrevious: goToPreviousNotes,
    goToNext: goToNextNotes,
    canGoPrevious: canGoPreviousNotes,
    canGoNext: canGoNextNotes,
  } = usePagination(notes, NOTES_PER_PAGE)

  return (
    <DashboardSection
      title={pathology?.patologia ?? "Patologia"}
      description="Consulta e aggiorna le note cliniche che guidano la gestione della patologia."
      actions={
        <div className="flex flex-col gap-2 sm:flex-row">
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
          <Button
            onClick={handleOpenTitleDialog}
            variant="outline"
            className="border-amber-200/70 text-amber-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 dark:border-amber-900/60 dark:text-amber-200 dark:hover:border-amber-700 dark:hover:bg-slate-900"
          >
            <FilePenLine className="mr-2 h-4 w-4" />
            Modifica nome
          </Button>
          <Button
            onClick={handleCreateNote}
            className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuova nota
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error ? (
          <Card className="border-rose-200/70 bg-rose-50/70 shadow-sm shadow-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/70 dark:shadow-rose-950/40">
            <CardHeader>
              <CardTitle className="text-rose-700 dark:text-rose-200">Si è verificato un errore</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <div className="space-y-4">
          {notesLoading ? (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="border-blue-200/70 bg-white/70 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40"
                >
                  <CardHeader className="space-y-3">
                    <Skeleton className="h-5 w-2/3 rounded-full" />
                    <Skeleton className="h-3 w-1/3 rounded-full" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-5/6 rounded-full" />
                    <Skeleton className="h-3 w-3/4 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <Card className="border-blue-200/70 bg-white/70 shadow-sm shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/70 dark:shadow-blue-950/40">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-blue-800 dark:text-blue-200">Nessuna nota registrata</CardTitle>
                <CardDescription>
                  Aggiungi la prima nota clinica per documentare iter diagnostici, strategie terapeutiche o follow-up.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  onClick={handleCreateNote}
                  className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Aggiungi nota
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="md:max-h-[65vh] md:overflow-y-auto md:pr-2">
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {visibleNotes.map((note) => (
                    <Card
                      key={note.id}
                      className="group border-blue-200/70 bg-white/80 transition hover:border-blue-300 hover:shadow-lg hover:shadow-blue-200/50 dark:border-blue-900/60 dark:bg-slate-950/80 dark:hover:border-blue-700 dark:hover:shadow-blue-900/50"
                    >
                      <CardHeader className="space-y-1">
                        <CardTitle className="flex items-center justify-between text-lg font-semibold text-slate-900 transition group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-200">
                          {note.titolo}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
                          Aggiornato: {formatTimestamp(note.updatedAt ?? note.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                        <p>{note.contenuto}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
                            onClick={() => handleEditNote(note)}
                          >
                            <FilePenLine className="mr-2 h-3.5 w-3.5" />
                            Modifica
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-200/70 text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-900 dark:border-rose-900/60 dark:text-rose-200 dark:hover:border-rose-700 dark:hover:bg-slate-900"
                            onClick={() => setNoteToDelete(note)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Elimina
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <PaginationControls
                currentPage={notePage}
                totalPages={totalNotePages}
                onPrevious={goToPreviousNotes}
                onNext={goToNextNotes}
                disablePrevious={!canGoPreviousNotes}
                disableNext={!canGoNextNotes}
                summary={`Pagina ${notePage} di ${totalNotePages}`}
              />
            </div>
          )}
        </div>

        {pathology ? (
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeletingPathology}
                  className="bg-linear-to-r from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-500/40 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isDeletingPathology ? "Eliminazione in corso..." : "Elimina patologia"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-rose-200/70 bg-white/95 shadow-xl shadow-rose-200/60 backdrop-blur dark:border-rose-900/60 dark:bg-rose-950/95 dark:shadow-rose-950/60">
                <AlertDialogHeader>
                  <AlertDialogTitle>Elimina patologia</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione eliminerà definitivamente la patologia e tutte le note associate. L'operazione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900">
                    Annulla
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePathology}
                    disabled={isDeletingPathology}
                    className="bg-linear-to-r from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-500/40 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {isDeletingPathology ? "Eliminazione..." : "Elimina"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            noteForm.reset(noteDefaultValues)
            setSelectedNote(null)
            setDialogMode("create")
          }
        }}
      >
        <DialogContent className="max-w-2xl border-blue-200/70 bg-white/95 shadow-xl shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/95 dark:shadow-blue-950/60">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Nuova nota clinica" : "Modifica nota clinica"}</DialogTitle>
            <DialogDescription>
              Documenta punti decisionali, protocolli terapeutici o note di follow-up relative a questa patologia.
            </DialogDescription>
          </DialogHeader>
          <Form {...noteForm}>
            <form onSubmit={noteForm.handleSubmit(handleSubmitNote)} className="grid gap-6">
              <FormField
                control={noteForm.control}
                name="titolo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titolo della nota</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Es. Strategia terapeutica"
                        className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={noteForm.control}
                name="contenuto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenuto</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Sintesi del workup, valutazioni multidisciplinari, follow-up..."
                        className="min-h-40 border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  disabled={isSubmittingNote}
                  className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmittingNote
                    ? "Salvataggio..."
                    : dialogMode === "create"
                    ? "Aggiungi nota"
                    : "Salva modifiche"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTitleOpen} onOpenChange={setIsEditTitleOpen}>
        <DialogContent className="max-w-lg border-blue-200/70 bg-white/95 shadow-xl shadow-blue-100/60 backdrop-blur dark:border-blue-900/60 dark:bg-slate-950/95 dark:shadow-blue-950/60">
          <DialogHeader>
            <DialogTitle>Modifica il nome della patologia</DialogTitle>
            <DialogDescription>Aggiorna il titolo per mantenerlo coerente con le tue convenzioni cliniche.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="pathology-title">Nome patologia</Label>
            <Input
              id="pathology-title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Es. Neoplasia pancreatica"
              className="border-blue-200/70 focus-visible:border-blue-500 focus-visible:ring-blue-500"
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
              onClick={handleUpdateTitle}
              disabled={isUpdatingTitle}
              className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isUpdatingTitle ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => (!open ? setNoteToDelete(null) : undefined)}>
        <AlertDialogContent className="border-rose-200/70 bg-white/95 shadow-xl shadow-rose-200/60 backdrop-blur dark:border-rose-900/60 dark:bg-rose-950/95 dark:shadow-rose-950/60">
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina nota</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi eliminare definitivamente questa nota clinica? L'operazione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              disabled={isDeletingNote}
              className="bg-linear-to-r from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-500/40 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isDeletingNote ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardSection>
  )
}
