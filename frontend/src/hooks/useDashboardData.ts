import { useMemo } from "react"
import { useStats, useRecentTodos } from "@/hooks/useStats"
import type { Stats } from "@/lib/api"

/**
 * [async-parallel] Promise.all() で統計データと最近のTodoを並列取得
 * React Query は複数の useQuery が同時にマウントされると自動的に並列フェッチする
 * BAD: await stats(); await recent(); のように直列で実行すると待ち時間が2倍になる
 */
export function useDashboardData() {
  const statsQuery = useStats()
  const recentQuery = useRecentTodos()

  /**
   * [rerender-derived-state] 統計データからグラフ用データを導出
   * useEffect ではなく useMemo で render フェーズで計算する
   *
   * [rerender-derived-state-no-effect] useEffect を使わず render フェーズで計算
   * BAD: useEffect + useState で派生状態を管理すると不要な再レンダーが発生する
   */
  const chartData = useMemo(() => {
    if (!statsQuery.data) return null
    return deriveChartData(statsQuery.data)
  }, [statsQuery.data])

  return {
    stats: statsQuery.data,
    recentTodos: recentQuery.data,
    chartData,
    isLoading: statsQuery.isLoading || recentQuery.isLoading,
    error: statsQuery.error || recentQuery.error,
  }
}

/**
 * [rerender-no-inline-components] 派生データの計算関数をコンポーネント外に定義
 * コンポーネント内に定義すると、レンダーごとに新しい関数が生成される
 */
function deriveChartData(stats: Stats) {
  /**
   * [rerender-simple-expression-in-memo] 単純な計算を useMemo に入れない
   * rate は stats から直接参照できるため、別途メモ化する必要はない
   */
  return {
    segments: [
      { label: "完了", value: stats.completed, color: "var(--chart-1)" },
      { label: "未完了", value: stats.active, color: "var(--chart-3)" },
    ],
    rate: stats.rate,
    total: stats.total,
  }
}
