"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/dashboard"
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User needs to be authenticated but isn't
        router.push("/login");
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be on this page (e.g., login/signup pages)
        router.push(redirectTo);
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background p-6">
        <Spinner className="size-10" />
      </div>
    );
  }

  // Show children only if authentication requirements are met
  if (requireAuth && !user) {
    return null; // Will redirect to login
  }

  if (!requireAuth && user) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
}