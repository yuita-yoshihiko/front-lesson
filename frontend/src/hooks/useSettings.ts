import { useState, useCallback } from "react"
import { createStorage } from "@/lib/storage"

export interface AppSettings {
  theme: "light" | "dark" | "system"
  itemsPerPage: number
  showCompleted: boolean
}

/**
 * [client-localstorage-schema] バージョン1のスキーマでストレージを定義
 * スキーマ変更時はバージョンを上げるだけで自動的にデフォルト値にフォールバックする
 */
const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  itemsPerPage: 10,
  showCompleted: true,
}

const storage = createStorage<AppSettings>("app-settings-v1", 1, DEFAULT_SETTINGS)

export function useSettings() {
  /**
   * [rerender-lazy-state-init] localStorage の初期読み込みをコールバック形式で実行
   * 関数を渡すことで、初回レンダリング時のみ localStorage から読み取る
   * BAD: useState(storage.get()) だと毎レンダリングで localStorage にアクセスする
   */
  const [settings, setSettings] = useState<AppSettings>(() => storage.get())

  /**
   * [rerender-functional-setstate] 関数型 setState で設定を更新
   * 前回の state を引数に取ることで、最新の state に基づいた更新を保証する
   * BAD: setSettings({ ...settings, [key]: value }) だと stale closure のリスクがある
   */
  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        storage.set(next)
        return next
      })
    },
    []
  )

  const resetSettings = useCallback(() => {
    storage.set(DEFAULT_SETTINGS)
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return { settings, updateSetting, resetSettings }
}
