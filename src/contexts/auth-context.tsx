"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db, getUserProfile, createUserProfile } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

  // Helper function to save user data to Firestore with error handling
  const saveUserToFirestore = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          provider: user.providerData[0]?.providerId || "email",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to save user data to Firestore:", error);
      // Don't throw error - this is not critical for authentication
    }
  };

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
        // Try to save user data to Firestore (non-blocking)
        saveUserToFirestore(user).catch(error => {
          console.error("Full error object when saving user data:", error);
        });
        setUser(user);
        // Fetch or create user profile
        try {
          let prof = await getUserProfile(user.uid);

          if (!prof) {
            const displayName = user.displayName?.trim() || "";
            const [firstName, ...rest] = displayName.split(" ");
            const lastName = rest.join(" ");

            await createUserProfile(user.uid, {
              firstName: firstName || "",
              lastName: lastName || "",
            });

            prof = await getUserProfile(user.uid);
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