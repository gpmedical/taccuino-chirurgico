"use client";

import { AuthGuard } from "@/components/auth/auth-guard"
import Link from "next/link"
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const forgotPasswordSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  async function handleResetPassword(values: ForgotPasswordFormValues) {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setSuccess(true);
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      const message = error instanceof Error ? error.message : "Invio dell'email di reimpostazione non riuscito. Riprova.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-100 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.5),_transparent_60%)]"
        />
        <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-blue-100/60 bg-white/80 p-6 text-center shadow-2xl shadow-blue-100/70 backdrop-blur-sm dark:border-blue-900/50 dark:bg-slate-950/60 dark:shadow-blue-950/40 sm:p-8">
          <Link
            href="/"
            className="flex items-center justify-center text-3xl font-semibold tracking-tight text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          >
            <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-500 dark:to-indigo-400">
              Taccuino Chirurgico
            </span>
          </Link>
          <Card className="border-blue-100/80 bg-white/80 py-5 text-left shadow-lg shadow-blue-100/60 backdrop-blur dark:border-blue-900/50 dark:bg-slate-950/60 dark:shadow-blue-950/40 sm:py-6">
            <CardHeader className="gap-2 text-center">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">Reimposta password</CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-300">
                Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleResetPassword)}>
                  <div className="grid gap-3 sm:gap-4">
                    <FormField
                      name="email"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              id="email"
                              type="email"
                              placeholder="nome.cognome@email.com"
                              disabled={loading}
                              autoComplete="email"
                              aria-label="Email"
                              role="textbox"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <div className="text-sm text-destructive text-center">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="text-sm text-emerald-500 text-center">
                        Controlla la tua email per il link di reimpostazione.
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-200/60 transition hover:from-sky-600 hover:to-blue-700 focus-visible:ring-blue-500/40"
                      disabled={loading}
                      aria-label="Invia link di reimpostazione"
                      role="button"
                    >
                      {loading ? "Invio in corso..." : "Invia link di reimpostazione"}
                    </Button>
                    <div className="text-center text-sm">
                      Ti sei ricordato la password?{" "}
                      <Link
                        href="/login"
                        className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                        aria-label="Accedi"
                        role="link"
                      >
                        Accedi
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}