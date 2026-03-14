import { useCallback, useRef } from "react"

/**
 * [js-batch-dom-css] DOM/CSS操作のバッチ処理フック
 * 複数のDOM操作を requestAnimationFrame でバッチ化し、
 * レイアウトスラッシング（読み取りと書き込みの交互発生）を防ぐ
 * BAD: el.style.width = ...; el.offsetHeight; el.style.height = ...;
 *      のように読み取りと書き込みを交互に行うとレイアウト再計算が複数回発生する
 */
export function useBatchDom() {
  const rafRef = useRef<number>(0)

  const batchUpdate = useCallback((updates: () => void) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(() => {
      updates()
      rafRef.current = 0
    })
  }, [])

  return { batchUpdate }
}
