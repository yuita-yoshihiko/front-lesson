import { Suspense, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { NavLink } from "@/components/nav/NavLink"
import { initAnalytics, trackPageView } from "@/lib/analytics"
import { useLocation } from "react-router-dom"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import {
  CheckSquare,
  BarChart3,
  Settings,
  Search,
  Activity,
} from "lucide-react"

/**
 * [rendering-hoist-jsx] 静的なローディングUIをコンポーネント外に巻き上げ
 * レンダリングごとに新しいJSX要素を生成するのを防ぎ、参照の安定性を保つ
 * BAD: コンポーネント内で <div>読み込み中...</div> を毎回生成する
 */
const LoadingFallback = (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-2">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">読み込み中...</p>
    </div>
  </div>
)

const navItems = [
  { to: "/", label: "Todo", icon: <CheckSquare className="h-4 w-4" /> },
  { to: "/dashboard", label: "ダッシュボード", icon: <BarChart3 className="h-4 w-4" /> },
  { to: "/search", label: "検索", icon: <Search className="h-4 w-4" /> },
  { to: "/activity", label: "アクティビティ", icon: <Activity className="h-4 w-4" /> },
  { to: "/settings", label: "設定", icon: <Settings className="h-4 w-4" /> },
] as const

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  /**
   * [bundle-defer-third-party] アナリティクスを hydration 後に遅延初期化
   * 初期レンダリングをブロックせず、アイドル時に初期化する
   */
  useEffect(() => {
    initAnalytics()
  }, [])

  // [rendering-script-defer-async] ページ遷移時にページビューを記録
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  /**
   * [client-event-listeners] グローバルキーボードショートカットの登録
   * useKeyboardShortcuts で一元管理し、重複排除とクリーンアップを保証する
   */
  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      handler: () => navigate("/search"),
      description: "検索にフォーカス",
    },
    {
      key: ",",
      ctrl: true,
      handler: () => navigate("/settings"),
      description: "設定を開く",
    },
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* ナビゲーションバー */}
      <nav className="mb-8 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-2">
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} icon={icon}>
            {label}
          </NavLink>
        ))}
      </nav>

      {/**
       * [async-suspense-boundaries] 各ルートを Suspense で囲む
       * 遅延読み込み中はフォールバックUIを表示し、ユーザーに待機状態を伝える
       * BAD: Suspense なしで React.lazy を使うとエラーになる
       */}
      <Suspense fallback={LoadingFallback}>
        <Outlet />
      </Suspense>
    </div>
  )
}
