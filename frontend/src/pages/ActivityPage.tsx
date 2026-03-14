import { useActivities } from "@/hooks/useActivities"
import { useStats } from "@/hooks/useStats"
import { ActivityLog } from "@/components/activity/ActivityLog"
import { CompletionAnimation } from "@/components/activity/CompletionAnimation"

/**
 * [bundle-dynamic-imports] ActivityPage は React.lazy() で遅延読み込み
 *
 * このページで学べるベストプラクティス:
 * - [rendering-content-visibility] 長いリストに content-visibility: auto
 * - [rendering-animate-svg-wrapper] SVGアニメーションをラッパーdivで実行
 * - [rendering-svg-precision] SVG座標精度を最適化
 * - [rendering-activity] Activity API の概念実演
 * - [js-batch-dom-css] DOM/CSS操作のバッチ処理
 * - [advanced-event-handler-refs] イベントハンドラの ref 化
 */
export default function ActivityPage() {
  const { data: activities, isLoading, error } = useActivities()
  const { data: stats } = useStats()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">アクティビティ</h1>
        {stats ? <CompletionAnimation rate={stats.rate} /> : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      ) : error ? (
        <p className="text-sm text-destructive">エラー: {error.message}</p>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <ActivityLog activities={activities ?? []} />
        </div>
      )}
    </div>
  )
}
