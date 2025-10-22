import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileSetupForm } from "@/components/auth/profile-setup-form";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ProfileSetupPage() {
  return (
    <AuthGuard requireAuth={true} profileRequirement="incomplete" redirectTo="/dashboard">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-primary">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide additional information to finish setting up your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSetupForm />
        </CardContent>
      </Card>
    </AuthGuard>
  );
} 