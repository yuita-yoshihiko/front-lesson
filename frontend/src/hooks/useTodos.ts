import { useCallback, useEffect, useMemo, useState } from "react"
import type { FilterType, Todo } from "@/types/todo"

const STORAGE_KEY = "todos-v1"

function loadFromStorage(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Todo[]) : []
  } catch {
    return []
  }
}

export function useTodos() {
  // rerender-lazy-state-init: 高コストな初期値はコールバック形式で渡す
  const [todos, setTodos] = useState<Todo[]>(loadFromStorage)
  const [filter, setFilter] = useState<FilterType>("all")

  // client-localstorage-schema: todos変化時にLocalStorage同期
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  // rerender-derived-state-no-effect: 派生値はrenderフェーズで計算
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

  // rerender-functional-setstate: コールバック安定化のためfunctional update
  const addTodo = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false, createdAt: Date.now() },
    ])
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }, [])

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { todos, filter, filteredTodos, counts, addTodo, toggleTodo, deleteTodo, setFilter }
}
