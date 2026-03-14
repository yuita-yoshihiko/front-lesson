import { cn } from "@/lib/utils"
import type { Activity } from "@/lib/api"

interface ActivityItemProps {
  activity: Activity
}

const ACTION_LABELS: Record<string, string> = {
  created: "作成",
  completed: "完了",
  uncompleted: "未完了に戻す",
  deleted: "削除",
}

const ACTION_COLORS: Record<string, string> = {
  created: "bg-chart-1",
  completed: "bg-chart-2",
  uncompleted: "bg-chart-4",
  deleted: "bg-destructive",
}

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span
        className={cn(
          "mt-1.5 inline-block h-2 w-2 rounded-full",
          ACTION_COLORS[activity.action] ?? "bg-muted-foreground"
        )}
      />
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{activity.todoText}</span>
          <span className="text-muted-foreground">
            {" "}を{ACTION_LABELS[activity.action] ?? activity.action}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(activity.createdAt).toLocaleString("ja-JP")}
        </p>
      </div>
    </div>
  )
}
