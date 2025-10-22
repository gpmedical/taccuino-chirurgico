"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GENDERS } from "@/lib/constants";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/auth-context";
import { createUserProfile, updateUserProfile } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { toast } from "sonner";
import { Button } from "../ui/button";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
});

interface ProfileSetupFormProps {
  initialData?: UserProfile | null;
}

export function ProfileSetupForm({ initialData }: ProfileSetupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();
  const isEditMode = !!initialData;

  const methods = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      gender: initialData?.gender ?? "",
    },
    mode: "onTouched",
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) {
      setError("You must be logged in to complete your profile.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isEditMode) {
        await updateUserProfile(user.uid, values as any);
        toast.success("Profile updated successfully!");
      } else {
        await createUserProfile(user.uid, {
          ...values,
          role: "Resident",
          specialty: "General",
        } as any);
        toast.success("Profile created successfully!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast.error(err.message || "Failed to save profile.");
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <p className="text-center font-semibold">
            {isEditMode ? "Edit Profile" : "Profile"}
          </p>
          <FormField
            name="firstName"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    {...field}
                    aria-label="First name"
                    role="textbox"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="lastName"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    {...field}
                    aria-label="Last name"
                    role="textbox"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="gender"
            control={methods.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    aria-label="Gender"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Finish"}
          </Button>
        </div>
        {error && (
          <div className="mt-4 text-sm text-destructive text-center">
            {error}
          </div>
        )}
      </form>
    </Form>
  );
} 