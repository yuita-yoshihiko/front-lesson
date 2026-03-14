import { useTodosApi } from "@/hooks/useTodosApi"
import { useFilteredTodos } from "@/hooks/useFilteredTodos"
import { TodoFilter } from "@/components/todo/TodoFilter"
import { TodoForm } from "@/components/todo/TodoForm"
import { TodoList } from "@/components/todo/TodoList"

function App() {
  const { todos, isLoading, error, addTodo, toggleTodo, deleteTodo } = useTodosApi()
  const { filter, setFilter, filteredTodos, counts } = useFilteredTodos(todos)

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Todo</h1>
      <div className="flex flex-col gap-4">
        <TodoForm onAdd={addTodo} />
        <TodoFilter current={filter} onChange={setFilter} counts={counts} />
        <TodoList
          todos={filteredTodos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  )
}

export default App
