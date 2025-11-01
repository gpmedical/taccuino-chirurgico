"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, createUserProfile } from "@/lib/firebase"
import { useState } from "react"
import Link from "next/link";
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

const passwordRequirements =
  "La password deve essere lunga almeno 8 caratteri e includere almeno 1 lettera maiuscola, 1 lettera minuscola, 1 numero e 1 carattere speciale.";

const signupSchema = z.object({
  firstName: z.string().min(1, "Inserisci il tuo nome"),
  lastName: z.string().min(1, "Inserisci il tuo cognome"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z
    .string()
    .min(8, passwordRequirements)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      passwordRequirements
    ),
  confirmPassword: z.string().min(8, "Conferma la tua password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signupSchema>;

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });
  async function handleSignUp(values: SignUpFormValues) {
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);

      if (userCredential.user) {
        const displayName = `${values.firstName} ${values.lastName}`.trim();
        if (displayName) {
          await updateProfile(userCredential.user, {
            displayName,
          });
        }

        await createUserProfile(userCredential.user.uid, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          provider: userCredential.user.providerData[0]?.providerId ?? "email",
        });
      }

      // The AuthProvider will handle the redirect when it detects the user is authenticated
    } catch (error: unknown) {
      console.error('Signup error:', error);
      const message = error instanceof Error ? error.message : 'Creazione dell\'account non riuscita. Riprova.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Benvenuto</h1>
          <p className="text-base text-slate-600 dark:text-slate-300">Registrati per iniziare</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <FormField
                name="firstName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mario"
                        disabled={loading}
                        autoComplete="given-name"
                        aria-label="Nome"
                        role="textbox"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="lastName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cognome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rossi"
                        disabled={loading}
                        autoComplete="family-name"
                        aria-label="Cognome"
                        role="textbox"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      disabled={loading}
                      autoComplete="new-password"
                      aria-label="Password"
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
                      disabled={loading}
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
            {error && <div className="text-center text-sm text-destructive">{error}</div>}
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-200/60 transition hover:from-sky-600 hover:to-blue-700 focus-visible:ring-blue-500/40"
              disabled={loading}
              aria-label="Registrati"
              role="button"
            >
              {loading ? "Creazione dell'account in corso..." : "Registrati"}
            </Button>
          </form>
        </Form>
      </div>
      <div className="text-center text-sm">
        Hai già un account?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
        >
          Accedi
        </Link>
      </div>
    </div>
  );
}
