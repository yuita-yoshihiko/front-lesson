import type { Activity } from "@/lib/api"
import { ActivityItem } from "./ActivityItem"

interface ActivityLogProps {
  activities: Activity[]
}

/**
 * [rendering-content-visibility] 長いリストに content-visibility: auto を適用
 * ビューポート外のアイテムのレンダリングをスキップし、初期レンダリングを高速化する
 * BAD: 全アイテムを一度にレンダリングすると、長いリストでパフォーマンスが低下する
 */
export function ActivityLog({ activities }: ActivityLogProps) {
  if (activities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        アクティビティがありません
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {activities.map((activity) => (
        <div
          key={activity.id}
          /**
           * [rendering-content-visibility] content-visibility: auto で
           * ビューポート外の要素のレンダリングを遅延させる
           */
          style={{ contentVisibility: "auto", containIntrinsicSize: "0 48px" }}
        >
          <ActivityItem activity={activity} />
        </div>
      ))}
    </div>
  )
}
