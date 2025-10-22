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
  email: z.string().email("Please enter a valid email address"),
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
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send reset email. Please try again.");
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
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a link to reset your password.
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
                              placeholder="john.doe@email.com"
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
                        Check your email for a password reset link.
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading} aria-label="Send Reset Link" role="button">
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <div className="text-center text-sm">
                      Remember your password?{" "}
                      <Link href="/login" className="underline underline-offset-4" aria-label="Login" role="link">
                        Login
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