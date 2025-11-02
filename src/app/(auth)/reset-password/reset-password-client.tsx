"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FirebaseError } from "firebase/app"
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { auth } from "@/lib/firebase"

const passwordRequirements =
  "La password deve essere lunga almeno 8 caratteri e includere almeno 1 lettera maiuscola, 1 lettera minuscola, 1 numero e 1 carattere speciale."

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, passwordRequirements)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        passwordRequirements
      ),
    confirmPassword: z.string().min(8, "Conferma la tua password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oobCode = useMemo(() => searchParams.get("oobCode"), [searchParams])
  const continueUrl = useMemo(() => searchParams.get("continueUrl"), [searchParams])
  const [verifying, setVerifying] = useState(true)
  const [actionError, setActionError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onTouched",
  })

  useEffect(() => {
    let cancelled = false

    const verifyCode = async () => {
      if (!oobCode) {
        setActionError("Link per il reset non valido.")
        setVerifying(false)
        return
      }

      try {
        const emailForReset = await verifyPasswordResetCode(auth, oobCode)
        if (!cancelled) {
          setEmail(emailForReset)
        }
      } catch (error) {
        console.error("Password reset code verification error:", error)
        if (!cancelled) {
          setActionError("Questo link non è più valido. Richiedi un nuovo reset della password.")
        }
      } finally {
        if (!cancelled) {
          setVerifying(false)
        }
      }
    }

    verifyCode()

    return () => {
      cancelled = true
    }
  }, [oobCode])

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!oobCode) {
      setActionError("Link per il reset non valido.")
      return
    }

    setSubmitting(true)
    setActionError("")

    try {
      await confirmPasswordReset(auth, oobCode, values.password)
      setSuccess(true)
      form.reset(values)

      setTimeout(() => {
        if (continueUrl) {
          router.push(continueUrl)
        } else {
          router.push("/login")
        }
      }, 1500)
    } catch (error) {
      console.error("Password reset error:", error)
      if (error instanceof FirebaseError) {
        if (error.code === "auth/weak-password") {
          form.setError("password", {
            type: "manual",
            message: passwordRequirements,
          })
        } else if (error.code === "auth/expired-action-code" || error.code === "auth/invalid-action-code") {
          setActionError("Questo link non è più valido. Richiedi un nuovo reset della password.")
        } else {
          setActionError("Impossibile reimpostare la password. Riprova.")
        }
      } else if (error instanceof Error) {
        setActionError(error.message)
      } else {
        setActionError("Impossibile reimpostare la password. Riprova.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-sky-50 via-white to-blue-100 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.35),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.5),transparent_60%)]"
        />
        <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-blue-100/60 bg-white/80 p-6 text-center shadow-2xl shadow-blue-100/70 backdrop-blur-sm dark:border-blue-900/50 dark:bg-slate-950/60 dark:shadow-blue-950/40 sm:p-8">
          <Link href="/" className="flex items-center justify-center transition hover:opacity-90">
            <Image
              src="/Logo.png"
              alt="Taccuino Chirurgico"
              width={858}
              height={318}
              className="h-28 w-auto dark:drop-shadow-[0_0_12px_rgba(37,99,235,0.35)]"
              priority
            />
          </Link>
          <div className="space-y-6 text-left">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Imposta una nuova password</h1>
              <p className="text-base text-slate-600 dark:text-slate-300">
                {verifying
                  ? "Stiamo verificando il tuo link di reset..."
                  : success
                    ? "Password aggiornata correttamente, stai per essere reindirizzato."
                    : email
                      ? `Stai reimpostando la password per ${email}.`
                      : "Inserisci una nuova password per completare il reset."}
              </p>
            </div>
            {actionError ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-destructive">{actionError}</p>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                  >
                    Richiedi un nuovo link
                  </Link>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-5">
                  <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nuova password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            disabled={verifying || submitting || success}
                            autoComplete="new-password"
                            aria-label="Nuova password"
                            role="textbox"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conferma password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            disabled={verifying || submitting || success}
                            autoComplete="new-password"
                            aria-label="Conferma password"
                            role="textbox"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-200/60 transition hover:from-sky-600 hover:to-blue-700 focus-visible:ring-blue-500/40"
                    disabled={verifying || submitting || success}
                    aria-label="Salva nuova password"
                    role="button"
                  >
                    {verifying
                      ? "Verifica in corso..."
                      : submitting
                        ? "Salvataggio..."
                        : success
                          ? "Password aggiornata"
                          : "Aggiorna password"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
          <div className="text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Torna al login
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
