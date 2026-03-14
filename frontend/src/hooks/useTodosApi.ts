import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { todoApi } from "@/lib/api"
import type { Todo } from "@/types/todo"

const QUERY_KEY = ["todos"] as const

export function useTodosApi() {
  const queryClient = useQueryClient()

  const { data: todos = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: todoApi.list,
    staleTime: 10_000,
  })

  const addTodo = useMutation({
    mutationFn: (text: string) => todoApi.create(text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY)
      const optimistic: Todo = {
        id: `optimistic-${Date.now()}`,
        text,
        completed: false,
        createdAt: Date.now(),
      }
      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old = []) => [optimistic, ...old])
      return { previous }
    },
    onError: (_err, _text, ctx) => {
      queryClient.setQueryData(QUERY_KEY, ctx?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  const toggleTodo = useMutation({
    mutationFn: (id: string) => {
      const todo = todos.find((t) => t.id === id)
      return todoApi.update(id, { completed: !todo?.completed })
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY)
      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(QUERY_KEY, ctx?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  const deleteTodo = useMutation({
    mutationFn: (id: string) => todoApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY)
      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old = []) => old.filter((t) => t.id !== id))
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(QUERY_KEY, ctx?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  return {
    todos,
    isLoading,
    error,
    addTodo: (text: string) => addTodo.mutate(text),
    toggleTodo: (id: string) => toggleTodo.mutate(id),
    deleteTodo: (id: string) => deleteTodo.mutate(id),
  }
}
