import React from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="flex w-full max-w-md flex-col gap-6">
        {children}  
      </div>
    </div>
  );
} 