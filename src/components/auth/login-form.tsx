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
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
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
import { GoogleIcon } from "@/components/ui/google-icon"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter a valid password"),
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
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoginWithGoogle() {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      // The AuthProvider will handle the redirect when it detects the user is authenticated
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to login with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)}>
              <div className="grid gap-4">
                <div className="flex flex-col gap-4">
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
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
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
                  <Button type="submit" className="w-full" disabled={loading} aria-label="Login" role="button">
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or
                  </span>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleLoginWithGoogle}
                  disabled={loading}
                  aria-label="Continue with Google"
                  role="button"
                >
                  <GoogleIcon className="mr-2 size-5" />
                  Continue with Google
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Sign up
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
  )
}
