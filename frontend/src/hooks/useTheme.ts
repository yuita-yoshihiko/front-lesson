import { useCallback, useEffect } from "react"
import { useSettings } from "@/hooks/useSettings"
import { useLatest } from "@/hooks/useLatest"
import { initOnce } from "@/lib/init-once"

type Theme = "light" | "dark" | "system"

/**
 * [advanced-init-once] テーマの初期化を一度だけ実行
 * ページ読み込み時に localStorage からテーマを読み取り、html 要素に適用する
 */
const initThemeOnce = initOnce(() => {
  const saved = localStorage.getItem("app-settings-v1")
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.version === 1 && parsed.data?.theme) {
        applyTheme(parsed.data.theme)
      }
    } catch {
      // ignore
    }
  }
})

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    root.classList.toggle("dark", isDark)
  } else {
    root.classList.toggle("dark", theme === "dark")
  }
}

export function useTheme() {
  const { settings, updateSetting } = useSettings()
  const theme = settings.theme

  /**
   * [advanced-use-latest] コールバック内で最新のテーマ値を参照
   * setTheme 関数は参照が安定しているため、イベントリスナーに安全に渡せる
   */
  const latestTheme = useLatest(theme)

  // 初期テーマ適用
  initThemeOnce()

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // system テーマの場合、OS設定変更を監視
  useEffect(() => {
    if (latestTheme.current !== "system") return
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyTheme("system")
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [latestTheme])

  const setTheme = useCallback(
    (newTheme: Theme) => updateSetting("theme", newTheme),
    [updateSetting]
  )

  return { theme, setTheme }
}
