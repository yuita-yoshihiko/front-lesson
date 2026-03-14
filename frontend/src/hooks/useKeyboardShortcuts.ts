import { useEffect, useRef, useLayoutEffect } from "react"

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description: string
}

/**
 * [client-event-listeners] グローバルキーボードショートカットの管理
 * useEffect のクリーンアップで確実にリスナーを除去し、メモリリークを防ぐ
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  /**
   * [rerender-use-ref-transient-values] ショートカット配列を ref で管理
   * ショートカット定義が変わってもリスナーの再登録が不要になる
   */
  const shortcutsRef = useRef(shortcuts)
  useLayoutEffect(() => {
    shortcutsRef.current = shortcuts
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const shortcut of shortcutsRef.current) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey

        if (e.key === shortcut.key && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault()
          shortcut.handler()
          return
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return shortcuts
}
