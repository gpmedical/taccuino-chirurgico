"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../lib/firebase"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
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
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Accesso non riuscito. Riprova.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card className="border-blue-100/80 bg-white/80 py-5 shadow-lg shadow-blue-100/60 backdrop-blur dark:border-blue-900/50 dark:bg-slate-950/60 dark:shadow-blue-950/40 sm:py-6">
        <CardHeader className="gap-2 text-center">
          <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">Bentornato</CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-slate-300">
            Accedi al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)}>
              <div className="grid gap-3 sm:gap-4">
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
                  <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
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
                            id="password"
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
                  {error && (
                    <div className="text-sm text-destructive text-center">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-200/60 transition hover:from-sky-600 hover:to-blue-700 focus-visible:ring-blue-500/40"
                    disabled={loading}
                    aria-label="Accedi"
                    role="button"
                  >
                    {loading ? 'Accesso in corso...' : 'Accedi'}
                  </Button>
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
            </form>
          </Form>
        </CardContent>
      </Card>

    </div>
  )
}
