"use client"

import { useEffect, useState } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedVal, setDebouncedVal] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedVal(value)
    }, delay)

    // cleanup
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedVal
}