"use client";

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-4 p-6 md:p-10 text-primary">
        <div className="flex size-16 items-center justify-center rounded-md">
        </div>
        <span className="text-2xl font-bold">MyApp</span>
      <Link href="/login">
        <Button variant="default">
          Get Started
        </Button>
      </Link>
    </div>
  )
}