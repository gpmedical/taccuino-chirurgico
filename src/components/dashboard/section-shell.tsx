import type { ReactNode } from "react"

export function DashboardSection({
  title,
  description,
  children,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
