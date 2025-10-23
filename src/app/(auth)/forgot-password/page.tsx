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
      <div className="bg-muted flex min-h-svh w-full flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center justify-center gap-2 self-center font-medium text-primary">
            <span className="text-center text-2xl font-bold">Taccuino Chirurgico</span>
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>Reimposta password</CardTitle>
              <CardDescription>
                Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleResetPassword)}>
                  <div className="grid gap-4">
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
                      <div className="text-sm text-green-500 text-center">
                        Controlla la tua email per il link di reimpostazione.
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading} aria-label="Invia link di reimpostazione" role="button">
                      {loading ? "Invio in corso..." : "Invia link di reimpostazione"}
                    </Button>
                    <div className="text-center text-sm">
                      Ti sei ricordato la password?{" "}
                      <Link href="/login" className="underline underline-offset-4" aria-label="Accedi" role="link">
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