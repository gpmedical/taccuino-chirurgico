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
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "../../lib/firebase"
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
import { GoogleIcon } from "@/components/ui/google-icon";

const passwordRequirements =
  "Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, passwordRequirements)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      passwordRequirements
    ),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signupSchema>;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z\d]/.test(password)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-destructive" };
  if (score === 3 || score === 4) return { label: "Medium", color: "bg-yellow-400" };
  return { label: "Strong", color: "bg-green-500" };
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });
  const passwordValue = form.watch("password");
  const strength = getPasswordStrength(passwordValue || "");

  async function handleSignUp(values: SignUpFormValues) {
    setLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      // The AuthProvider will handle the redirect when it detects the user is authenticated
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUpWithGoogle() {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      // The AuthProvider will handle the redirect when it detects the user is authenticated
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError(error.message || 'Failed to sign up with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to MyApp</CardTitle>
          <CardDescription>
            Sign up to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignUp)}>
              <div className="grid gap-4">
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
                  <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            disabled={loading}
                            autoComplete="new-password"
                            aria-label="Password"
                            role="textbox"
                            {...field}
                          />
                        </FormControl>
                        {passwordValue && (
                          <div className="mt-1 flex items-center gap-2 w-full" role="status" aria-live="polite">
                            <div className="flex-1 flex items-center">
                              <div
                                className={`h-2 w-full rounded ${strength.color} transition-all`}
                                role="progressbar"
                                aria-valuenow={strength.label === "Weak" ? 33 : strength.label === "Medium" ? 66 : 100}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Password strength: ${strength.label}`}
                              />
                            </div>
                            <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">{strength.label} password</span>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="********"
                            disabled={loading}
                            autoComplete="new-password"
                            aria-label="Confirm Password"
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
                  <Button type="submit" className="w-full" disabled={loading} aria-label="Sign Up" role="button">
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleSignUpWithGoogle}
                    disabled={loading}
                    aria-label="Continue with Google"
                    role="button"
                  >
                    <GoogleIcon className="mr-2 size-5" />
                    Continue with Google
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By continuing, you agree to our <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  );
}
