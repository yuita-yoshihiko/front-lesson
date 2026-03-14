import { useTodosApi } from "@/hooks/useTodosApi"
import { useFilteredTodos } from "@/hooks/useFilteredTodos"
import { useCategories } from "@/hooks/useCategories"
import { TodoFilter } from "@/components/todo/TodoFilter"
import { TodoForm } from "@/components/todo/TodoForm"
import { TodoList } from "@/components/todo/TodoList"
import { CategoryList } from "@/components/category/CategoryList"

/**
 * [bundle-dynamic-imports] TodoPage は React.lazy() で遅延読み込みされる
 * ルーター定義側で動的インポートし、初期バンドルサイズを削減する
 */
export default function TodoPage() {
  const { todos, isLoading, error, addTodo, toggleTodo, deleteTodo } = useTodosApi()
  const { filter, setFilter, filteredTodos, counts } = useFilteredTodos(todos)
  const { categoryMap } = useCategories()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Todo</h1>
      <TodoForm onAdd={addTodo} />
      <TodoFilter current={filter} onChange={setFilter} counts={counts} />
      <TodoList
        todos={filteredTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        isLoading={isLoading}
        error={error}
        categoryMap={categoryMap}
      />

      {/* カテゴリ管理セクション */}
      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">カテゴリ管理</h2>
        <CategoryList />
      </section>
    </div>
  )
}
