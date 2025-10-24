"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CircleUserRound,
  Files,
  Home,
  RefreshCw,
  Shapes,
  Stethoscope,
  Syringe,
} from "lucide-react"

import Toggle from "@/app/toggle"
import { AuthGuard } from "@/components/auth/auth-guard"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

const NAVIGATION = [
  {
    title: "Cruscotto",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Interventi chirurgici",
    href: "/dashboard/interventi-chirurgici",
    icon: Syringe,
  },
  {
    title: "Patologie chirurgiche",
    href: "/dashboard/patologie-chirurgiche",
    icon: Stethoscope,
  },
  {
    title: "Casi clinici",
    href: "/dashboard/casi-clinici",
    icon: Files,
  },
  {
    title: "Pazienti",
    href: "/dashboard/pazienti",
    icon: RefreshCw,
  },
  {
    title: "Miscellanea",
    href: "/dashboard/miscellanea",
    icon: Shapes,
  },
] as const

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <AuthGuard requireAuth>
      <SidebarProvider>
        <div className="relative flex min-h-svh w-full bg-linear-to-br from-sky-50 via-white to-blue-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 dark:text-slate-100">
          <Sidebar className="border-border/60 bg-linear-to-b from-white/90 via-blue-50/80 to-sky-100/70 backdrop-blur supports-backdrop-filter:bg-white/70 dark:from-slate-950/80 dark:via-slate-900/70 dark:to-blue-950/60">
            <SidebarHeader className="px-4 pb-3 pt-8">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
              >
                <div className="rounded-xl bg-linear-to-br from-sky-500 via-blue-600 to-indigo-600 p-2 text-white shadow-md shadow-blue-500/40 dark:from-sky-400 dark:via-blue-500 dark:to-indigo-400">
                  <CircleUserRound className="h-5 w-5" />
                </div>
                <span className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-500 dark:to-indigo-400">
                  Taccuino Chirurgico
                </span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu principale</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {NAVIGATION.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`)

                      return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 text-sm font-medium text-slate-700 transition hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-300"
                          >
                            <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="mt-auto px-4 pb-6">
              <div className="flex items-center gap-3 rounded-2xl border border-blue-200/60 bg-white/70 p-3 shadow-sm shadow-blue-100/60 backdrop-blur-sm dark:border-blue-900/60 dark:bg-slate-950/60 dark:shadow-blue-950/40">
                <Avatar className="h-10 w-10 border border-blue-200/70 dark:border-blue-900/70">
                  <AvatarFallback className="bg-blue-600/90 text-white dark:bg-blue-500/80">
                    {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "TC"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    {user?.displayName || "Chirurgo"}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-3 w-full border-blue-200/70 text-blue-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
                onClick={signOut}
              >
                Esci
              </Button>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="bg-transparent">
            <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-blue-200/70 bg-white/75 px-4 backdrop-blur-md supports-backdrop-filter:bg-white/60 dark:border-blue-900/60 dark:bg-slate-950/80 md:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-blue-700 hover:bg-blue-100 hover:text-blue-900 dark:text-blue-200 dark:hover:bg-slate-900" />
                <h1 className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-lg font-semibold text-transparent md:text-2xl">
                  Taccuino Chirurgico
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Toggle />
                <ProfileMenu
                  name={user?.displayName || "Chirurgo"}
                  email={user?.email || "Account professionale"}
                  onSignOut={signOut}
                />
              </div>
            </header>
            <div className="relative flex-1 px-4 py-6 md:px-10">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.25),transparent_60%)]" />
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                {children}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}

function ProfileMenu({
  name,
  email,
  onSignOut,
}: {
  name: string
  email: string
  onSignOut: () => Promise<void> | void
}) {
  const initials = (name || email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 rounded-full border border-blue-100/70 bg-white/70 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/50 transition hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-900 dark:border-blue-900/60 dark:bg-slate-950/70 dark:text-blue-200 dark:shadow-blue-950/40 dark:hover:border-blue-700 dark:hover:bg-slate-900"
        >
          <Avatar className="h-8 w-8 border border-blue-200/70 dark:border-blue-900/70">
            <AvatarFallback className="bg-blue-600/90 text-white dark:bg-blue-500/80">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[200px] bg-white/95 backdrop-blur-md dark:bg-slate-950/90" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">{name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-blue-700 focus:bg-blue-50/80 focus:text-blue-900 dark:text-blue-200 dark:focus:bg-slate-900">
          Profilo
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-blue-700 focus:bg-blue-50/80 focus:text-blue-900 dark:text-blue-200 dark:focus:bg-slate-900">
          Impostazioni
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/40"
        >
          Esci
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
