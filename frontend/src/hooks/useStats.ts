import { useQuery } from "@tanstack/react-query"
import { statsApi } from "@/lib/api"

/**
 * [rerender-dependencies] クエリキーにプリミティブ値を指定
 * オブジェクトや配列をキーにすると参照比較で常に新しいキーと判定されてしまう
 */
const STATS_KEY = ["stats"] as const
const RECENT_KEY = ["todos", "recent"] as const

export function useStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: statsApi.get,
    staleTime: 5_000,
  })
}

export function useRecentTodos() {
  return useQuery({
    queryKey: RECENT_KEY,
    queryFn: statsApi.recent,
    staleTime: 5_000,
  })
}
