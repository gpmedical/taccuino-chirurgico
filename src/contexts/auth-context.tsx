"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, getUserProfile, createUserProfile, updateUserProfile } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to redirect to dashboard
  const redirectToDashboard = useCallback(() => {
    if (!mounted) return;
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/') {
      router.push('/dashboard');
    }
  }, [mounted, router]);

  useEffect(() => {
    let isMounted = true;

    // Fallback timeout to ensure loading state resolves
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        setUser(user);
        // Fetch or create user profile
        try {
          const displayName = user.displayName?.trim() || "";
          const [firstName, ...rest] = displayName.split(" ");
          const lastName = rest.join(" ");
          const email = user.email ?? "";
          const provider = user.providerData[0]?.providerId || "email";
          const baseProfile = {
            firstName: firstName || "",
            lastName: lastName || "",
            email,
            provider,
          };

          let prof = await getUserProfile(user.uid);

          if (!prof) {
            await createUserProfile(user.uid, baseProfile);
            prof = await getUserProfile(user.uid);
          } else {
            const updates: Partial<Omit<UserProfile, "userId" | "createdAt" | "updatedAt">> = {};
            if (prof.email !== email && email) {
              updates.email = email;
            }
            if (prof.provider !== provider) {
              updates.provider = provider;
            }
            if (!prof.firstName && baseProfile.firstName) {
              updates.firstName = baseProfile.firstName;
            }
            if (!prof.lastName && baseProfile.lastName) {
              updates.lastName = baseProfile.lastName;
            }
            if (Object.keys(updates).length > 0) {
              await updateUserProfile(user.uid, updates);
              prof = await getUserProfile(user.uid);
            }
          }

          setProfile((prof ?? null) as UserProfile | null);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setProfile(null);
        }
        // Redirect to dashboard if user is authenticated and we're on auth pages
        redirectToDashboard();
      } else {
        setUser(null);
        setProfile(null);
      }
      if (isMounted) {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [router, loading, redirectToDashboard]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 
