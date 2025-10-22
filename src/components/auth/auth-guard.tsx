"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  profileRequirement?: 'complete' | 'incomplete' | 'none';
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = "/dashboard",
  profileRequirement = 'none'
}: AuthGuardProps) {
  const { user, loading, isProfileComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User needs to be authenticated but isn't
        router.push("/login");
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be on this page (e.g., login/signup pages)
        router.push(redirectTo);
      } else if (requireAuth && user && profileRequirement === 'complete' && !isProfileComplete) {
        // User is authenticated but profile is not complete
        router.push("/profile-setup");
      } else if (requireAuth && user && profileRequirement === 'incomplete' && isProfileComplete) {
        // User is authenticated and profile is complete, but they are on a page for incomplete profiles
        router.push(redirectTo);
      }
    }
  }, [user, loading, requireAuth, redirectTo, router, profileRequirement, isProfileComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
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

  if (requireAuth && user && profileRequirement === 'complete' && !isProfileComplete) {
    return null; // Will redirect to profile-setup
  }

  if (requireAuth && user && profileRequirement === 'incomplete' && isProfileComplete) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
} 