"use client"

import { Button } from "@/components/ui/button"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <AuthGuard requireAuth={true} profileRequirement="complete">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome, {user?.displayName || 'User'}</p>
        <Button onClick={signOut} variant="destructive" className="mt-4">Sign Out</Button>
      </div>
    </AuthGuard>
  )
}