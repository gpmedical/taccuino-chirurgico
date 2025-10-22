import React from "react";

export default function ProfileSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted" aria-label="Profile setup" role="main">
      {children}
    </div>
  );
} 