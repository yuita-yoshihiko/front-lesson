import { useState, useEffect } from "react"

/**
 * [rerender-use-ref-transient-values] デバウンスのタイマーIDを内部で管理
 * useEffect のクリーンアップでタイマーをキャンセルし、メモリリークを防ぐ
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
