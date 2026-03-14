import { useTodos } from "@/hooks/useTodos"
import { TodoFilter } from "@/components/todo/TodoFilter"
import { TodoForm } from "@/components/todo/TodoForm"
import { TodoList } from "@/components/todo/TodoList"

function App() {
  const { filter, filteredTodos, counts, addTodo, toggleTodo, deleteTodo, setFilter } =
    useTodos()

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Todo</h1>
      <div className="flex flex-col gap-4">
        <TodoForm onAdd={addTodo} />
        <TodoFilter current={filter} onChange={setFilter} counts={counts} />
        <TodoList todos={filteredTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
      </div>
    </div>
  )
}

export default App
