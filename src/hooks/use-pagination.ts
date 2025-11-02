import { useEffect, useMemo, useState } from "react"

export interface UsePaginationResult<T> {
  currentPage: number
  totalPages: number
  pageItems: T[]
  goToPrevious: () => void
  goToNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  setPage: (page: number) => void
  pageSize: number
  itemCount: number
}

export function usePagination<T>(items: T[], pageSize: number): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1)

  const itemCount = items.length

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(itemCount / pageSize))
  }, [itemCount, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemCount, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const goToPrevious = () => {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  const goToNext = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  const setPage = (page: number) => {
    const safePage = Number.isFinite(page) ? page : 1
    setCurrentPage(() => {
      if (safePage < 1) return 1
      if (safePage > totalPages) return totalPages
      return Math.floor(safePage)
    })
  }

  return {
    currentPage,
    totalPages,
    pageItems,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
    setPage,
    pageSize,
    itemCount,
  }
}
