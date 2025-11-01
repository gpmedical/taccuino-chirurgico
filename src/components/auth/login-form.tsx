"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../lib/firebase"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FirebaseError } from "firebase/app"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "Inserisci una password valida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  async function handleLogin(values: LoginFormValues) {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // The AuthProvider will handle the redirect when it detects the user is authenticated
    } catch (error: unknown) {
      console.error("Login error:", error)
      let message = "Accesso non riuscito. Riprova."
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-credential") {
          message = "Credenziali non valide."
        } else if (error.message) {
          message = error.message
        }
      } else if (error instanceof Error) {
        message = error.message
      }
      setError(message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Bentornato</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">Accedi al tuo account</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
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
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm font-medium text-blue-600 underline-offset-4 hover:text-blue-700 hover:underline dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Hai dimenticato la password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      disabled={loading}
                      autoComplete="current-password"
                      aria-label="Password"
                      role="textbox"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-center text-sm text-destructive">{error}</div>}
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-200/60 transition hover:from-sky-600 hover:to-blue-700 focus-visible:ring-blue-500/40"
              disabled={loading}
              aria-label="Accedi"
              role="button"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </Form>
      </div>
      <div className="text-center text-sm">
        Non hai un account?{" "}
        <Link
          href="/signup"
          className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
        >
          Registrati
        </Link>
      </div>
    </div>
  )
}
