import { useRef, useLayoutEffect } from "react"

/**
 * [advanced-use-latest] コールバック内で最新の値を参照するためのフック
 * ref を使って常に最新の値を保持し、useCallback の依存配列に値を含めずに済む
 * BAD: useCallback の依存配列に値を含めると、値が変わるたびに新しい関数が生成される
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value)

  useLayoutEffect(() => {
    ref.current = value
  })

  return ref
}
