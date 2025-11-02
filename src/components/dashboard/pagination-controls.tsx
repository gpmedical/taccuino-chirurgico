import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  disablePrevious?: boolean
  disableNext?: boolean
  summary?: ReactNode
  className?: string
  previousLabel?: string
  nextLabel?: string
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  disablePrevious = false,
  disableNext = false,
  summary,
  className,
  previousLabel = "Precedente",
  nextLabel = "Successiva",
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn("flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}>
      {summary ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {summary}
        </p>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pagina {currentPage} di {totalPages}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
          onClick={onPrevious}
          disabled={disablePrevious}
        >
          {previousLabel}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-200/70 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 dark:border-blue-900/60 dark:text-blue-200 dark:hover:border-blue-700 dark:hover:bg-slate-900"
          onClick={onNext}
          disabled={disableNext}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}
