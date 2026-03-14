import { memo } from "react"

interface ChartSegment {
  label: string
  value: number
  color: string
}

interface CompletionChartProps {
  segments: ChartSegment[]
  rate: number
  total: number
}

/**
 * [rerender-memo] memo() でSVGチャートコンポーネントをメモ化
 * SVGの再レンダーは特にコストが高いため、props 変化時のみ更新する
 */
export const CompletionChart = memo(function CompletionChart({
  segments,
  rate,
  total,
}: CompletionChartProps) {
  // [rendering-conditional-render] total === 0 の場合の明示的な条件レンダリング
  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-sm text-muted-foreground">データがありません</p>
      </div>
    )
  }

  /**
   * [rendering-svg-precision] SVG座標精度を最適化
   * 小数点以下2桁に丸めることで、SVGのファイルサイズを削減する
   * BAD: 不必要に高精度な小数（例: 3.141592653589793）はパースコストを増大させる
   */
  const radius = 70
  const circumference = +(2 * Math.PI * radius).toFixed(2)
  const completedLength = +(circumference * rate).toFixed(2)
  const remainingLength = +(circumference - completedLength).toFixed(2)

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">完了率</h3>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* 背景円 */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="12"
        />
        {/* 完了率の円弧 */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={segments[0]?.color ?? "var(--chart-1)"}
          strokeWidth="12"
          strokeDasharray={`${completedLength} ${remainingLength}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        {/* 中央テキスト */}
        <text
          x="90"
          y="85"
          textAnchor="middle"
          className="fill-foreground text-3xl font-bold"
        >
          {Math.round(rate * 100)}%
        </text>
        <text
          x="90"
          y="108"
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
        >
          {segments[0]?.value ?? 0} / {total}
        </text>
      </svg>
      <div className="flex gap-4">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            {seg.label}: {seg.value}
          </div>
        ))}
      </div>
    </div>
  )
})
