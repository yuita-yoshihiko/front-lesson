import { memo } from "react"
import type { Stats } from "@/lib/api"

interface StatsOverviewProps {
  stats: Stats
}

/**
 * [rerender-memo] memo() で重い統計コンポーネントを最適化
 * 親コンポーネントが再レンダーしても props が変わらなければスキップする
 * BAD: memo なしでは親のすべての再レンダーで子もレンダーされる
 */
export const StatsOverview = memo(function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="合計" value={stats.total} />
      <StatCard label="未完了" value={stats.active} />
      <StatCard label="完了" value={stats.completed} />
      <StatCard label="完了率" value={`${Math.round(stats.rate * 100)}%`} />
    </div>
  )
})

/**
 * [rerender-memo-with-default-value] デフォルトの非プリミティブ値を定数化
 * BAD: ({ style = {} }) のようにデフォルト値をインラインで書くと
 *      毎回新しいオブジェクト参照が生成され、memo の効果が無効化される
 */
const DEFAULT_CLASS = "rounded-lg border border-border bg-card p-4"

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={DEFAULT_CLASS}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
