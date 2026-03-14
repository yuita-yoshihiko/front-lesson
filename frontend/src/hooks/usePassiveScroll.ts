import { useEffect, useRef, useLayoutEffect } from "react"

/**
 * [client-passive-event-listeners] スクロールイベントに passive オプションを設定
 * passive: true にすることで、ブラウザにスクロールをブロックしないことを伝え、
 * スクロールパフォーマンスを向上させる
 * BAD: passive なしでスクロールイベントを登録すると、ブラウザが
 *      preventDefault() の呼び出しを待機し、スクロールが遅延する
 */
export function usePassiveScroll(
  handler: (event: Event) => void,
  element?: React.RefObject<HTMLElement | null>
) {
  const handlerRef = useRef(handler)
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const target = element?.current ?? window
    const listener = (event: Event) => handlerRef.current(event)

    // [client-passive-event-listeners] passive: true で登録
    target.addEventListener("scroll", listener, { passive: true })
    return () => target.removeEventListener("scroll", listener)
  }, [element])
}
