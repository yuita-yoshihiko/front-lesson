import type { Todo } from "@/types/todo"
import type { Category } from "@/types/category"
import { TodoItem } from "./TodoItem"

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
  error?: Error | null
  categoryMap?: Map<string, Category>
}

export function TodoList({ todos, onToggle, onDelete, isLoading, error, categoryMap }: TodoListProps) {
  if (isLoading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">読み込み中...</p>
    )
  }

  if (error) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        エラー: {error.message}
      </p>
    )
  }

  if (todos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todoがありません
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} categoryMap={categoryMap} />
      ))}
    </ul>
  )
}
