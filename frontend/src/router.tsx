import { lazy } from "react"
import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"

/**
 * [bundle-dynamic-imports] React.lazy() で各ページを遅延読み込み
 * ルートごとに個別チャンクが生成され、初期バンドルサイズを大幅に削減する
 * BAD: import TodoPage from "./pages/TodoPage" のように静的インポートすると
 *      全ページのコードが1つのバンドルに含まれてしまう
 */

// [bundle-barrel-imports] 直接ファイルパスを指定してインポート
// BAD: import { TodoPage } from "./pages" のようなバレルインポートは
//      ツリーシェイキングが効かず不要なモジュールもバンドルに含まれる
const TodoPage = lazy(() => import("@/pages/TodoPage"))
const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))
const SearchPage = lazy(() => import("@/pages/SearchPage"))
const ActivityPage = lazy(() => import("@/pages/ActivityPage"))

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <TodoPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/activity", element: <ActivityPage /> },
    ],
  },
])
