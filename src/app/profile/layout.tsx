import React from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6 sm:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
