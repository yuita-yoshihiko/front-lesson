import { useMemo } from "react"
import type { Todo } from "@/types/todo"

/**
 * [js-cache-function-results] カテゴリ別フィルタ結果をメモ化するフック
 * カテゴリIDが変わらなければフィルタ結果を再利用する
 */
export function useTodosByCategory(todos: Todo[], categoryId: string | null) {
  return useMemo(() => {
    /**
     * [js-length-check-first] 空配列チェックを先に行い無駄な処理を回避
     */
    if (todos.length === 0) return []

    // カテゴリ未指定なら全件返す
    if (!categoryId) return todos

    /**
     * [js-flatmap-filter] flatMap で filter+map を1パスに最適化する例
     * ここでは filter のみだが、変換が必要な場合は flatMap を使う
     *
     * [js-tosorted-immutable] toSorted() で元配列を変更せずソート
     * BAD: array.sort() は元配列をミューテートする
     */
    return todos
      .filter((todo) => todo.categoryId === categoryId)
  }, [todos, categoryId])
}
