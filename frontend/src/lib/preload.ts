/**
 * [bundle-preload] ルートプリロードユーティリティ
 * ナビリンクの hover/focus 時にチャンクを事前読み込みし、
 * ページ遷移時のロード時間を削減する
 */

// [bundle-preload] 各ルートの動的インポート関数を登録し、hover時にプリロードを発火する
const routeImports: Record<string, () => Promise<unknown>> = {
  "/": () => import("@/pages/TodoPage"),
  "/dashboard": () => import("@/pages/DashboardPage"),
  "/settings": () => import("@/pages/SettingsPage"),
  "/search": () => import("@/pages/SearchPage"),
  "/activity": () => import("@/pages/ActivityPage"),
}

// [bundle-preload] 一度プリロードしたモジュールは再読み込みしない
const preloaded = new Set<string>()

export function preloadRoute(path: string): void {
  if (preloaded.has(path)) return
  const loader = routeImports[path]
  if (loader) {
    preloaded.add(path)
    loader()
  }
}
