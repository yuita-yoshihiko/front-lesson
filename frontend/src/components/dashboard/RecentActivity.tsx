import { memo } from "react"
import { cn } from "@/lib/utils"
import type { Todo } from "@/types/todo"

interface RecentActivityProps {
  todos: Todo[]
}

/**
 * [rerender-memo] memo() で最近のアクティビティ一覧をメモ化
 * todos 配列の参照が変わらない限り再レンダーをスキップする
 */
export const RecentActivity = memo(function RecentActivity({ todos }: RecentActivityProps) {
  // [rendering-conditional-render] 三項演算子で空状態を明示的にレンダリング
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">最近のTodo</h3>
      {todos.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          まだTodoがありません
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  todo.completed ? "bg-chart-1" : "bg-chart-3"
                )}
              />
              <span className={cn(todo.completed && "text-muted-foreground line-through")}>
                {todo.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
