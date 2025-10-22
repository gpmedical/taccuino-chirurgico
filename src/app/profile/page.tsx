"use client";

import { ProfileSetupForm } from "@/components/auth/profile-setup-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card";

export default function ProfilePage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true} profileRequirement="complete">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-primary">Edit Your Profile</CardTitle>
          <CardDescription>
            Edit your account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSetupForm initialData={profile} />
        </CardContent>
      </Card>
    </AuthGuard>
  );
} 