import React from "react";

export default function ProfileSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 sm:p-10" aria-label="Profile setup" role="main">
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
