import { useRef, useCallback, useLayoutEffect } from "react"

/**
 * [advanced-event-handler-refs] イベントハンドラの ref 化
 * ハンドラ関数を ref で保持し、useCallback の依存配列を空にする
 * これにより、ハンドラの参照が安定し、子コンポーネントの不要な再レンダーを防ぐ
 * BAD: useCallback([fn], [dep1, dep2]) は依存が変わるたびに新しい関数を生成する
 */
export function useEventHandlerRef<T extends (...args: never[]) => unknown>(
  handler: T
): (...args: Parameters<T>) => ReturnType<T> {
  const handlerRef = useRef(handler)
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useCallback(
    (...args: Parameters<T>) => handlerRef.current(...args) as ReturnType<T>,
    []
  )
}
