/**
 * [bundle-dynamic-imports] App.tsx は router.tsx に移行済み
 * このファイルは後方互換性のためにリダイレクトとして残す
 *
 * 実際のアプリケーション構造:
 * - main.tsx → RouterProvider (router.tsx)
 * - router.tsx → AppLayout + 各ページの React.lazy() 定義
 * - AppLayout → ナビゲーション + Suspense + Outlet
 */
import { RouterProvider } from "react-router-dom"
import { router } from "./router"

function App() {
  return <RouterProvider router={router} />
}

export default App
