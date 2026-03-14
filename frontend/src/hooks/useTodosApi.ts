import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { todoApi } from "@/lib/api"
import type { Todo } from "@/types/todo"

const QUERY_KEY = ["todos"] as const

/**
 * [client-swr-dedup] React Query の重複排除パターン
 * 同じクエリキーを使う複数のコンポーネントが同時にマウントされても、
 * React Query がリクエストを重複排除し、1回のfetchで済ませる
 * BAD: 各コンポーネントで個別に fetch を呼ぶと、同じデータを複数回取得してしまう
 *
 * [server-cache-react] React Query のキャッシュ戦略
 * staleTime: データが "新鮮" とみなされる時間（この間は再フェッチしない）
 * gcTime: ガベージコレクションまでの時間（アンマウント後もキャッシュを保持）
 * refetchOnWindowFocus: ウィンドウフォーカス時に自動再フェッチ
 */
export function useTodosApi() {
  const queryClient = useQueryClient()

  const { data: todos = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: todoApi.list,
    staleTime: 10_000,
    // [server-cache-react] キャッシュをアンマウント後も5分間保持
    gcTime: 5 * 60 * 1000,
    // [server-cache-react] ウィンドウフォーカス時に自動再フェッチ
    refetchOnWindowFocus: true,
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
        categoryId: "",
      }
      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old = []) => [optimistic, ...old])
      return { previous }
    },
    onError: (_err, _text, ctx) => {
      queryClient.setQueryData(QUERY_KEY, ctx?.previous)
    },
    /**
     * [async-api-routes] onSettled で関連キャッシュも同時にinvalidate
     * Todo の変更は stats と activities にも影響するため、一括でinvalidateする
     */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
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
