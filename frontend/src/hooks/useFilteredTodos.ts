import { useMemo, useState } from "react"
import type { FilterType, Todo } from "@/types/todo"

export function useFilteredTodos(todos: Todo[]) {
  const [filter, setFilter] = useState<FilterType>("all")

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed)
    if (filter === "completed") return todos.filter((t) => t.completed)
    return todos
  }, [todos, filter])

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos]
  )

  return { filter, setFilter, filteredTodos, counts }
}
