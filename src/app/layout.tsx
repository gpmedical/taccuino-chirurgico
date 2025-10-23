import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taccuino Chirurgico",
  description: "Taccuino Chirurgico, il compagno chirurgico mobile-first.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} antialiased`}
        aria-label="Main content"
        role="main"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
