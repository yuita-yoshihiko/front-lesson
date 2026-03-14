import { useEffect, useRef, useLayoutEffect } from "react"

/**
 * [client-event-listeners] グローバルイベントリスナーの重複排除フック
 * useEffect のクリーンアップで確実にリスナーを除去し、メモリリークを防ぐ
 * BAD: addEventListener を直接呼ぶと、コンポーネントのアンマウント時にリスナーが残る
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
) {
  /**
   * [rerender-use-ref-transient-values] ハンドラ関数を ref で管理
   * ref を使うことで、ハンドラが変わってもリスナーの再登録が不要になる
   */
  const handlerRef = useRef(handler)
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const listener = (event: WindowEventMap[K]) => handlerRef.current(event)
    window.addEventListener(eventName, listener, options)
    return () => window.removeEventListener(eventName, listener, options)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName])
}
