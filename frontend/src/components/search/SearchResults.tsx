import { cn } from "@/lib/utils"
import type { Todo } from "@/types/todo"

interface SearchResultsProps {
  results: Todo[]
  query: string
}

export function SearchResults({ results, query }: SearchResultsProps) {
  // [rendering-conditional-render] 三項演算子で空状態を明示的にレンダリング
  return results.length === 0 ? (
    <div className="py-8 text-center">
      <p className="text-sm text-muted-foreground">
        {query ? `「${query}」に一致するTodoはありません` : "検索キーワードを入力してください"}
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{results.length}件の結果</p>
      <ul className="flex flex-col gap-2">
        {results.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                todo.completed ? "bg-chart-1" : "bg-chart-3"
              )}
            />
            <span
              className={cn(
                "flex-1 text-sm",
                todo.completed && "text-muted-foreground line-through"
              )}
            >
              {todo.text}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(todo.createdAt).toLocaleDateString("ja-JP")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
