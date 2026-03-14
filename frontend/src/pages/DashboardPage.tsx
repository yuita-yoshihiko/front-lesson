import { useDashboardData } from "@/hooks/useDashboardData"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { CompletionChart } from "@/components/dashboard/CompletionChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"

/**
 * [bundle-dynamic-imports] DashboardPage は React.lazy() で遅延読み込みされる
 *
 * [async-parallel] このページでは stats と recent の2つのAPIを並列フェッチする
 * useDashboardData 内で useStats() と useRecentTodos() が同時に発火する
 */
export default function DashboardPage() {
  const { stats, recentTodos, chartData, isLoading, error } = useDashboardData()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-sm text-destructive">エラー: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {/* [rendering-conditional-render] stats が null の場合をガード */}
      {stats ? <StatsOverview stats={stats} /> : null}

      <div className="grid gap-6 md:grid-cols-2">
        {chartData ? (
          <CompletionChart
            segments={chartData.segments}
            rate={chartData.rate}
            total={chartData.total}
          />
        ) : null}

        {recentTodos ? <RecentActivity todos={recentTodos} /> : null}
      </div>
    </div>
  )
}
